import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
// Pour utiliser Supabase, vous avez besoin de :
// 1. SUPABASE_URL : https://[votre-projet-ref].supabase.co
// 2. SUPABASE_SERVICE_ROLE_KEY : Clé secrète (pour les opérations serveur)

// Option 1 : Utiliser @supabase/supabase-js (recommandé)
// Remplacez ces valeurs par vos vraies credentials Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Option 2 : Si vous avez seulement la chaîne de connexion PostgreSQL,
// vous devrez extraire l'URL Supabase depuis votre dashboard Supabase
// et utiliser la clé API (anon key ou service role key)

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Alternative : Client pour connexion directe PostgreSQL avec pg
// Si vous préférez utiliser directement la chaîne de connexion PostgreSQL
// Décommentez et installez : npm install pg @types/pg

/*
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || '';

export const db = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});
*/

























