import { NextResponse } from 'next/server';
import { db, query } from '@/lib/db-pg';

export async function GET() {
  try {
    // Test simple de connexion
    const result = await query('SELECT NOW() as current_time, version() as pg_version');
    
    return NextResponse.json({
      success: true,
      message: 'Connexion à Supabase PostgreSQL réussie! ✅',
      data: {
        currentTime: result.rows[0].current_time,
        postgresVersion: result.rows[0].pg_version.split(',')[0],
      },
    });
  } catch (error: any) {
    console.error('Erreur de connexion:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur de connexion à la base de données',
        error: error.message,
        hint: 'Vérifiez que DATABASE_URL est correctement configuré dans .env.local',
      },
      { status: 500 }
    );
  }
}

























