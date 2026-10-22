/* =========================================================
   BasketZone · Capa de datos (Supabase)
   ---------------------------------------------------------
   Expone funciones pequeñas y tipadas por contrato:
     - fetchCatalog({ category, brand, search })
     - signUp / signIn / signOut / getSession
     - createOrder({ items, customer })
     - fetchMyOrders()
   ========================================================= */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_CONFIGURED } from './config.js';

export const isConfigured = IS_CONFIGURED;

export const supabase = IS_CONFIGURED
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true }
    })
    : null;

/* ---------------------------------------------------------
   Catálogo
   --------------------------------------------------------- */
export async function fetchCatalog({ category = '', brand = '', search = '' } = {}) {
    let query = supabase
        .from('catalog_products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

    if (category) { query = query.eq('category_slug', category); }
    if (brand) { query = query.eq('brand_slug', brand); }
    if (search) { query = query.ilike('name', `%${search}%`); }

    const { data, error } = await query;
    if (error) { throw error; }
    return data ?? [];
}

export async function fetchFilters() {
    const [categories, brands] = await Promise.all([
        supabase.from('categories').select('slug, name').order('name'),
        supabase.from('brands').select('slug, name').order('name')
    ]);
    if (categories.error) { throw categories.error; }
    if (brands.error) { throw brands.error; }
    return { categories: categories.data ?? [], brands: brands.data ?? [] };
}

/* ---------------------------------------------------------
   Cuentas
   --------------------------------------------------------- */
export async function signUp({ email, password, fullName }) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
    });
    if (error) { throw error; }
    return data;
}

export async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { throw error; }
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) { throw error; }
}

export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) { throw error; }
    return data.session;
}

export function onAuthChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
}

/* ---------------------------------------------------------
   Pedidos
   --------------------------------------------------------- */
export async function createOrder({ items, customer }) {
    const payload = items.map((item) => ({
        variant_id: item.variantId,
        quantity: item.quantity
    }));

    const { data, error } = await supabase.rpc('create_order', {
        p_customer: customer,
        p_items: payload
    });
    if (error) { throw error; }
    return data;
}

export async function fetchMyOrders() {
    const { data, error } = await supabase
        .from('orders')
        .select('id, status, total_cents, created_at, order_items(product_name, size, quantity, unit_price_cents)')
        .order('created_at', { ascending: false });
    if (error) { throw error; }
    return data ?? [];
}
