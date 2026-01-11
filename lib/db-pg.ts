// Configuration PostgreSQL directe avec node-postgres
// Pour utiliser cette option, installez : npm install pg @types/pg

import { Pool } from 'pg';

// Extraire les informations de la chaîne de connexion
// postgresql://postgres.sihqjtkdlmguhsjlqamz:[MOT-DE-PASSE]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL n\'est pas défini dans les variables d\'environnement');
}

export const db = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Nécessaire pour Supabase
  },
  max: 20, // Nombre maximum de connexions dans le pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de connexion
db.on('error', (err) => {
  console.error('Erreur de connexion PostgreSQL:', err);
});

// Fonction helper pour les requêtes
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await db.query(text, params);
    const duration = Date.now() - start;
    console.log('Query exécutée', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Erreur de requête:', error);
    throw error;
  }
}

























