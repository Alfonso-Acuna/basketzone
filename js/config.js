/* =========================================================
   BasketZone · Configuración del cliente
   ---------------------------------------------------------
   Proyecto Supabase activo. La "publishable key" es pública por
   diseño: la seguridad real la impone Row Level Security (RLS)
   y la función create_order en el servidor.
   ========================================================= */

export const SUPABASE_URL = 'https://awitypuohlxkcaknqteo.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_3uqUc4DU4iKR7BhVQmtDaQ_u3yM-x5D';

export const IS_CONFIGURED =
    !SUPABASE_URL.includes('TU-PROYECTO') &&
    !SUPABASE_PUBLISHABLE_KEY.includes('TU_ANON_KEY') &&
    SUPABASE_URL.startsWith('https://');
