/* =========================================================
   BasketZone · Configuración del cliente
   ---------------------------------------------------------
   Rellena estos dos valores con los de tu proyecto de Supabase
   (Settings -> API). La "anon key" es pública por diseño: la
   seguridad real la impone Row Level Security en la base de datos.
   ========================================================= */

export const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
export const SUPABASE_ANON_KEY = 'TU_ANON_KEY';

export const IS_CONFIGURED =
    !SUPABASE_URL.includes('TU-PROYECTO') &&
    !SUPABASE_ANON_KEY.includes('TU_ANON_KEY') &&
    SUPABASE_URL.startsWith('https://');
