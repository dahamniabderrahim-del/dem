import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer les alertes de stock (faible stock et expiration proche)
export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Médicaments en stock faible
    const lowStockMedicaments = await prisma.medicament.findMany({
      where: {
        stock: {
          lte: prisma.medicament.fields.minStock,
        },
      },
      orderBy: {
        stock: 'asc',
      },
    });

    // Médicaments expirés ou expirant bientôt
    const expiringMedicaments = await prisma.medicament.findMany({
      where: {
        expiryDate: {
          lte: thirtyDaysFromNow,
          not: null,
        },
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    return NextResponse.json({
      lowStock: lowStockMedicaments,
      expiring: expiringMedicaments,
    });
  } catch (error: any) {
    console.error('Error fetching stock alerts:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération des alertes' },
      { status: 500 }
    );
  }
}













