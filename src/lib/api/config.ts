// API Configuration
// This file can be swapped for mobile-specific configuration

// Web configuration (Vite)
const isWeb = typeof import.meta !== 'undefined' && import.meta.env;

export const apiConfig = {
  supabaseUrl: isWeb 
    ? import.meta.env.VITE_SUPABASE_URL 
    : process.env.SUPABASE_URL || '',
  supabaseKey: isWeb 
    ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY 
    : process.env.SUPABASE_ANON_KEY || '',
  get idxEdgeFunctionUrl() {
    return `${this.supabaseUrl}/functions/v1/idx-properties`;
  },
};

// For mobile apps (React Native/Expo), replace with:
// export const apiConfig = {
//   supabaseUrl: process.env.SUPABASE_URL || 'https://frsaqmaoguadryrjgcxv.supabase.co',
//   supabaseKey: process.env.SUPABASE_ANON_KEY || '',
//   get idxEdgeFunctionUrl() {
//     return `${this.supabaseUrl}/functions/v1/idx-properties`;
//   },
// };
