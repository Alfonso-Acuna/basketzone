/* =========================================================
   BasketZone · Datos de demostración
   Se usan SOLO cuando no hay credenciales de Supabase.
   Reflejan el seed de supabase/schema.sql para que la tienda
   sea navegable antes de conectar la base de datos.
   ========================================================= */

export const DEMO_CATEGORIES = [
    { slug: 'zapatillas', name: 'Zapatillas' },
    { slug: 'camisetas', name: 'Camisetas' },
    { slug: 'accesorios', name: 'Accesorios' }
];

export const DEMO_BRANDS = [
    { slug: 'jordan', name: 'Jordan' },
    { slug: 'nike', name: 'Nike' },
    { slug: 'adidas', name: 'Adidas' },
    { slug: 'under-armour', name: 'Under Armour' }
];

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const DEMO_PRODUCTS = [
    {
        id: 'demo-1', slug: 'air-jordan-4-retro', name: 'Air Jordan 4 Retro',
        description: 'Silueta icónica con unidad Air visible, refuerzos laterales y tracción para cancha cubierta.',
        price_cents: 18999, currency: 'EUR', image_url: img('photo-1608245449230-4ac19066d2d0'),
        category_slug: 'zapatillas', category_name: 'Zapatillas',
        brand_slug: 'jordan', brand_name: 'Jordan', is_active: true,
        variants: [
            { id: 'demo-1-40', size: '40 EU', stock: 4 },
            { id: 'demo-1-41', size: '41 EU', stock: 6 },
            { id: 'demo-1-42', size: '42 EU', stock: 3 },
            { id: 'demo-1-43', size: '43 EU', stock: 5 },
            { id: 'demo-1-44', size: '44 EU', stock: 2 }
        ],
        total_stock: 20
    },
    {
        id: 'demo-2', slug: 'lebron-xxi', name: 'LeBron XXI',
        description: 'Amortiguación máxima y soporte lateral para jugadores de potencia.',
        price_cents: 17499, currency: 'EUR', image_url: img('photo-1519861531473-9200262188bf'),
        category_slug: 'zapatillas', category_name: 'Zapatillas',
        brand_slug: 'nike', brand_name: 'Nike', is_active: true,
        variants: [
            { id: 'demo-2-41', size: '41 EU', stock: 5 },
            { id: 'demo-2-42', size: '42 EU', stock: 7 },
            { id: 'demo-2-43', size: '43 EU', stock: 4 },
            { id: 'demo-2-44', size: '44 EU', stock: 3 }
        ],
        total_stock: 19
    },
    {
        id: 'demo-3', slug: 'curry-flow-11', name: 'Curry Flow 11',
        description: 'Ligereza extrema y agarre para tiradores que viven en el perímetro.',
        price_cents: 14999, currency: 'EUR', image_url: img('photo-1519432359516-73a2bb421826'),
        category_slug: 'zapatillas', category_name: 'Zapatillas',
        brand_slug: 'under-armour', brand_name: 'Under Armour', is_active: true,
        variants: [
            { id: 'demo-3-40', size: '40 EU', stock: 6 },
            { id: 'demo-3-41', size: '41 EU', stock: 2 },
            { id: 'demo-3-42', size: '42 EU', stock: 0 },
            { id: 'demo-3-43', size: '43 EU', stock: 4 }
        ],
        total_stock: 12
    },
    {
        id: 'demo-4', slug: 'camiseta-basketzone-pro', name: 'Camiseta BasketZone Pro',
        description: 'Tejido técnico de secado rápido con mangas sin costuras y corte athletic.',
        price_cents: 3499, currency: 'EUR', image_url: img('photo-1572454181157-0b40dd7667fe'),
        category_slug: 'camisetas', category_name: 'Camisetas',
        brand_slug: 'nike', brand_name: 'Nike', is_active: true,
        variants: [
            { id: 'demo-4-s', size: 'S', stock: 10 },
            { id: 'demo-4-m', size: 'M', stock: 14 },
            { id: 'demo-4-l', size: 'L', stock: 8 },
            { id: 'demo-4-xl', size: 'XL', stock: 5 }
        ],
        total_stock: 37
    },
    {
        id: 'demo-5', slug: 'camiseta-retro-23', name: 'Camiseta Retro 23',
        description: 'Homenaje a los clásicos: algodón pesado, cuello reforzado y número estampado.',
        price_cents: 3999, currency: 'EUR', image_url: img('photo-1702136931777-28cf9b8e4517'),
        category_slug: 'camisetas', category_name: 'Camisetas',
        brand_slug: 'jordan', brand_name: 'Jordan', is_active: true,
        variants: [
            { id: 'demo-5-s', size: 'S', stock: 6 },
            { id: 'demo-5-m', size: 'M', stock: 9 },
            { id: 'demo-5-l', size: 'L', stock: 7 },
            { id: 'demo-5-xl', size: 'XL', stock: 0 }
        ],
        total_stock: 22
    },
    {
        id: 'demo-6', slug: 'balon-oficial-talla-7', name: 'Balón oficial talla 7',
        description: 'Balón de composite con canales profundos, presión 7,5–8,5 psi y agarre premium.',
        price_cents: 4999, currency: 'EUR', image_url: img('photo-1519861531473-9200262188bf'),
        category_slug: 'accesorios', category_name: 'Accesorios',
        brand_slug: 'adidas', brand_name: 'Adidas', is_active: true,
        variants: [{ id: 'demo-6-u', size: 'Única', stock: 12 }],
        total_stock: 12
    }
];
