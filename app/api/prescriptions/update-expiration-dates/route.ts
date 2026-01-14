import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/appointmentHelpers';

/**
 * Route pour mettre à jour les dates d'expiration des prescriptions existantes
 * qui n'ont pas de date d'expiration calculée
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Fonction non disponible avec le schéma actuel." },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error updating expiration dates:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}














