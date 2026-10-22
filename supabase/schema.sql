-- =========================================================
-- BasketZone · Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================

-- ---------------------------------------------------------
-- 1. Tipos
-- ---------------------------------------------------------
do $$
begin
    if not exists (select 1 from pg_type where typname = 'order_status') then
        create type public.order_status as enum
            ('pending', 'paid', 'shipped', 'delivered', 'cancelled');
    end if;
end $$;

-- ---------------------------------------------------------
-- 2. Catálogo
-- ---------------------------------------------------------
create table if not exists public.categories (
    id          uuid primary key default gen_random_uuid(),
    slug        text not null unique,
    name        text not null,
    description text,
    created_at  timestamptz not null default now()
);

create table if not exists public.brands (
    id         uuid primary key default gen_random_uuid(),
    slug       text not null unique,
    name       text not null,
    logo_url   text,
    created_at timestamptz not null default now()
);

create table if not exists public.products (
    id          uuid primary key default gen_random_uuid(),
    slug        text not null unique,
    name        text not null,
    description text,
    category_id uuid references public.categories (id) on delete restrict,
    brand_id    uuid references public.brands (id) on delete set null,
    price_cents integer not null check (price_cents >= 0),
    currency    text not null default 'EUR',
    image_url   text,
    is_active   boolean not null default true,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create table if not exists public.product_variants (
    id         uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products (id) on delete cascade,
    size       text not null,
    stock      integer not null default 0 check (stock >= 0),
    sku        text unique,
    created_at timestamptz not null default now(),
    unique (product_id, size)
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_brand_idx on public.products (brand_id);
create index if not exists variants_product_idx on public.product_variants (product_id);

-- ---------------------------------------------------------
-- 3. Usuarios (perfil público de auth.users)
-- ---------------------------------------------------------
create table if not exists public.profiles (
    id          uuid primary key references auth.users (id) on delete cascade,
    full_name   text,
    phone       text,
    address     text,
    city        text,
    postal_code text,
    country     text default 'España',
    role        text not null default 'customer' check (role in ('customer', 'admin')),
    created_at  timestamptz not null default now()
);

-- Crea el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, full_name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ---------------------------------------------------------
-- 4. Pedidos
-- ---------------------------------------------------------
create table if not exists public.orders (
    id               uuid primary key default gen_random_uuid(),
    user_id          uuid references auth.users (id) on delete set null,
    status           public.order_status not null default 'pending',
    customer_name    text not null,
    customer_email   text not null,
    shipping_address text not null,
    subtotal_cents   integer not null default 0 check (subtotal_cents >= 0),
    shipping_cents   integer not null default 0 check (shipping_cents >= 0),
    total_cents      integer not null default 0 check (total_cents >= 0),
    created_at       timestamptz not null default now()
);

create table if not exists public.order_items (
    id               uuid primary key default gen_random_uuid(),
    order_id         uuid not null references public.orders (id) on delete cascade,
    product_id       uuid references public.products (id) on delete set null,
    variant_id       uuid references public.product_variants (id) on delete set null,
    product_name     text not null,
    size             text not null,
    unit_price_cents integer not null check (unit_price_cents >= 0),
    quantity         integer not null check (quantity > 0)
);

create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------
-- 5. Vista de catálogo (producto + marca + categoría + tallas)
-- ---------------------------------------------------------
create or replace view public.catalog_products
with (security_invoker = on) as
select
    p.id,
    p.slug,
    p.name,
    p.description,
    p.price_cents,
    p.currency,
    p.image_url,
    p.is_active,
    c.slug as category_slug,
    c.name as category_name,
    b.slug as brand_slug,
    b.name as brand_name,
    coalesce(
        jsonb_agg(
            jsonb_build_object('id', v.id, 'size', v.size, 'stock', v.stock)
            order by v.size
        ) filter (where v.id is not null),
        '[]'::jsonb
    ) as variants,
    coalesce(sum(v.stock), 0)::int as total_stock
from public.products p
left join public.categories c on c.id = p.category_id
left join public.brands b on b.id = p.brand_id
left join public.product_variants v on v.product_id = p.id
group by p.id, c.slug, c.name, b.slug, b.name;

grant select on public.catalog_products to anon, authenticated;
grant select on public.categories, public.brands, public.products, public.product_variants
    to anon, authenticated;

-- ---------------------------------------------------------
-- 6. Seguridad a nivel de fila (RLS)
-- ---------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
    );
$$;

alter table public.categories       enable row level security;
alter table public.brands           enable row level security;
alter table public.products         enable row level security;
alter table public.product_variants enable row level security;
alter table public.profiles         enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;

-- Lectura pública del catálogo
drop policy if exists "categorias visibles" on public.categories;
create policy "categorias visibles" on public.categories
    for select using (true);

drop policy if exists "marcas visibles" on public.brands;
create policy "marcas visibles" on public.brands
    for select using (true);

drop policy if exists "productos activos visibles" on public.products;
create policy "productos activos visibles" on public.products
    for select using (is_active or public.is_admin());

drop policy if exists "variantes visibles" on public.product_variants;
create policy "variantes visibles" on public.product_variants
    for select using (true);

-- Escritura solo para administradores
drop policy if exists "admin gestiona categorias" on public.categories;
create policy "admin gestiona categorias" on public.categories
    for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin gestiona marcas" on public.brands;
create policy "admin gestiona marcas" on public.brands
    for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin gestiona productos" on public.products;
create policy "admin gestiona productos" on public.products
    for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin gestiona variantes" on public.product_variants;
create policy "admin gestiona variantes" on public.product_variants
    for all using (public.is_admin()) with check (public.is_admin());

-- Perfiles
drop policy if exists "perfil propio visible" on public.profiles;
create policy "perfil propio visible" on public.profiles
    for select using (auth.uid() = id or public.is_admin());

drop policy if exists "perfil propio editable" on public.profiles;
create policy "perfil propio editable" on public.profiles
    for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "perfil propio insertable" on public.profiles;
create policy "perfil propio insertable" on public.profiles
    for insert with check (auth.uid() = id);

-- Pedidos
drop policy if exists "pedidos propios visibles" on public.orders;
create policy "pedidos propios visibles" on public.orders
    for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "pedido propio insertable" on public.orders;
create policy "pedido propio insertable" on public.orders
    for insert with check (auth.uid() = user_id);

drop policy if exists "admin actualiza pedidos" on public.orders;
create policy "admin actualiza pedidos" on public.orders
    for update using (public.is_admin());

-- Líneas de pedido
drop policy if exists "items de pedidos propios" on public.order_items;
create policy "items de pedidos propios" on public.order_items
    for select using (
        exists (
            select 1 from public.orders o
            where o.id = order_items.order_id
              and (o.user_id = auth.uid() or public.is_admin())
        )
    );

-- ---------------------------------------------------------
-- 7. RPC atómica para guardar un pedido y descontar stock
--    El precio y el stock se validan SIEMPRE en el servidor.
-- ---------------------------------------------------------
create or replace function public.create_order(
    p_customer jsonb,
    p_items    jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_uid      uuid := auth.uid();
    v_order_id uuid;
    v_item     jsonb;
    v_variant  record;
    v_qty      integer;
    v_subtotal integer := 0;
    v_ship     integer := 0;
    v_total    integer := 0;
begin
    if v_uid is null then
        raise exception 'Debes iniciar sesión para finalizar la compra';
    end if;

    if p_items is null or jsonb_array_length(p_items) = 0 then
        raise exception 'El carrito está vacío';
    end if;

    insert into public.orders (
        user_id, status, customer_name, customer_email, shipping_address,
        subtotal_cents, shipping_cents, total_cents
    ) values (
        v_uid, 'pending',
        coalesce(p_customer ->> 'name', ''),
        coalesce(p_customer ->> 'email', ''),
        coalesce(p_customer ->> 'address', ''),
        0, 0, 0
    ) returning id into v_order_id;

    for v_item in select * from jsonb_array_elements(p_items)
    loop
        v_qty := coalesce((v_item ->> 'quantity')::int, 0);

        if v_qty <= 0 then
            raise exception 'Cantidad inválida';
        end if;

        select
            v.id, v.product_id, v.size, v.stock,
            p.name as product_name, p.price_cents, p.is_active
        into v_variant
        from public.product_variants v
        join public.products p on p.id = v.product_id
        where v.id = (v_item ->> 'variant_id')::uuid
        for update of v;

        if not found then
            raise exception 'La variante solicitada no existe';
        end if;

        if not v_variant.is_active then
            raise exception 'El producto % no está disponible', v_variant.product_name;
        end if;

        if v_variant.stock < v_qty then
            raise exception 'Sin stock suficiente de % (talla %)',
                v_variant.product_name, v_variant.size;
        end if;

        insert into public.order_items (
            order_id, product_id, variant_id, product_name, size,
            unit_price_cents, quantity
        ) values (
            v_order_id, v_variant.product_id, v_variant.id, v_variant.product_name,
            v_variant.size, v_variant.price_cents, v_qty
        );

        update public.product_variants
           set stock = stock - v_qty
         where id = v_variant.id;

        v_subtotal := v_subtotal + (v_variant.price_cents * v_qty);
    end loop;

    v_ship := case when v_subtotal >= 8000 then 0 else 499 end;
    v_total := v_subtotal + v_ship;

    update public.orders
       set subtotal_cents = v_subtotal,
           shipping_cents = v_ship,
           total_cents = v_total
     where id = v_order_id;

    return jsonb_build_object(
        'order_id', v_order_id,
        'status', 'pending',
        'subtotal_cents', v_subtotal,
        'shipping_cents', v_ship,
        'total_cents', v_total
    );
end;
$$;

revoke all on function public.create_order(jsonb, jsonb) from public;
grant execute on function public.create_order(jsonb, jsonb) to authenticated;

-- ---------------------------------------------------------
-- 8. Datos de ejemplo
-- ---------------------------------------------------------
insert into public.categories (slug, name, description) values
    ('zapatillas', 'Zapatillas', 'Calzado de baloncesto para cancha cubierta y exterior'),
    ('camisetas',  'Camisetas',  'Camisetas y equipaciones de juego'),
    ('accesorios', 'Accesorios', 'Balones, calcetines y complementos')
on conflict (slug) do nothing;

insert into public.brands (slug, name) values
    ('jordan',       'Jordan'),
    ('nike',         'Nike'),
    ('adidas',       'Adidas'),
    ('under-armour', 'Under Armour')
on conflict (slug) do nothing;

insert into public.products (slug, name, description, category_id, brand_id, price_cents, image_url) values
    ('air-jordan-4-retro', 'Air Jordan 4 Retro',
     'Silueta icónica con unidad Air visible, refuerzos laterales y tracción para cancha cubierta.',
     (select id from public.categories where slug = 'zapatillas'),
     (select id from public.brands where slug = 'jordan'), 18999,
     'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?auto=format&fit=crop&w=900&q=80'),

    ('lebron-xxi', 'LeBron XXI',
     'Amortiguación máxima y soporte lateral para jugadores de potencia.',
     (select id from public.categories where slug = 'zapatillas'),
     (select id from public.brands where slug = 'nike'), 17499,
     'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=900&q=80'),

    ('curry-flow-11', 'Curry Flow 11',
     'Ligereza extrema y agarre para tiradores que viven en el perímetro.',
     (select id from public.categories where slug = 'zapatillas'),
     (select id from public.brands where slug = 'under-armour'), 14999,
     'https://images.unsplash.com/photo-1519432359516-73a2bb421826?auto=format&fit=crop&w=900&q=80'),

    ('camiseta-basketzone-pro', 'Camiseta BasketZone Pro',
     'Tejido técnico de secado rápido con mangas sin costuras y corte athletic.',
     (select id from public.categories where slug = 'camisetas'),
     (select id from public.brands where slug = 'nike'), 3499,
     'https://images.unsplash.com/photo-1572454181157-0b40dd7667fe?auto=format&fit=crop&w=900&q=80'),

    ('camiseta-retro-23', 'Camiseta Retro 23',
     'Homenaje a los clásicos: algodón pesado, cuello reforzado y número estampado.',
     (select id from public.categories where slug = 'camisetas'),
     (select id from public.brands where slug = 'jordan'), 3999,
     'https://images.unsplash.com/photo-1702136931777-28cf9b8e4517?auto=format&fit=crop&w=900&q=80'),

    ('balon-oficial-talla-7', 'Balón oficial talla 7',
     'Balón de composite con canales profundos, presión 7,5–8,5 psi y agarre premium.',
     (select id from public.categories where slug = 'accesorios'),
     (select id from public.brands where slug = 'adidas'), 4999,
     'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=900&q=80')
on conflict (slug) do nothing;

insert into public.product_variants (product_id, size, stock)
select p.id, s.size, s.stock
from public.products p
join (values
    ('air-jordan-4-retro',    '40 EU', 4),
    ('air-jordan-4-retro',    '41 EU', 6),
    ('air-jordan-4-retro',    '42 EU', 3),
    ('air-jordan-4-retro',    '43 EU', 5),
    ('air-jordan-4-retro',    '44 EU', 2),
    ('lebron-xxi',            '41 EU', 5),
    ('lebron-xxi',            '42 EU', 7),
    ('lebron-xxi',            '43 EU', 4),
    ('lebron-xxi',            '44 EU', 3),
    ('curry-flow-11',         '40 EU', 6),
    ('curry-flow-11',         '41 EU', 2),
    ('curry-flow-11',         '42 EU', 0),
    ('curry-flow-11',         '43 EU', 4),
    ('camiseta-basketzone-pro', 'S', 10),
    ('camiseta-basketzone-pro', 'M', 14),
    ('camiseta-basketzone-pro', 'L', 8),
    ('camiseta-basketzone-pro', 'XL', 5),
    ('camiseta-retro-23',     'S', 6),
    ('camiseta-retro-23',     'M', 9),
    ('camiseta-retro-23',     'L', 7),
    ('camiseta-retro-23',     'XL', 0),
    ('balon-oficial-talla-7', 'Única', 12)
) as s (slug, size, stock) on s.slug = p.slug
on conflict (product_id, size) do nothing;

-- ---------------------------------------------------------
-- 9. Convertir a un usuario en administrador (opcional)
--    Reemplaza el correo por el de tu cuenta.
-- ---------------------------------------------------------
-- update public.profiles set role = 'admin'
--  where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
