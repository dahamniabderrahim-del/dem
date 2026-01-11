import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Liste tous les mouvements de stock
export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const medicamentId = searchParams.get('medicamentId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    if (medicamentId) where.medicamentId = medicamentId;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        medicament: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(movements);
  } catch (error: any) {
    console.error('Error fetching stock movements:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau mouvement de stock
export async function POST(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user || (user.role !== 'admin' && user.role !== 'medecin')) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Médecin requis' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { medicamentId, type, quantity, reason, referenceId, notes } = data;

    if (!medicamentId || !type || !quantity) {
      return NextResponse.json(
        { message: 'Le médicament, le type et la quantité sont requis' },
        { status: 400 }
      );
    }

    // Mettre à jour le stock du médicament
    const medicament = await prisma.medicament.findUnique({
      where: { id: medicamentId },
    });

    if (!medicament) {
      return NextResponse.json(
        { message: 'Médicament non trouvé' },
        { status: 404 }
      );
    }

    let newStock = medicament.stock;
    if (type === 'entree') {
      newStock += quantity;
    } else if (type === 'sortie' || type === 'perte') {
      newStock -= quantity;
      if (newStock < 0) {
        return NextResponse.json(
          { message: 'Stock insuffisant' },
          { status: 400 }
        );
      }
    }

    // Créer le mouvement et mettre à jour le stock en transaction
    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          medicamentId,
          type,
          quantity,
          reason: reason || null,
          referenceId: referenceId || null,
          notes: notes || null,
          createdBy: user.id,
        },
      }),
      prisma.medicament.update({
        where: { id: medicamentId },
        data: { stock: newStock },
      }),
    ]);

    return NextResponse.json(movement, { status: 201 });
  } catch (error: any) {
    console.error('Error creating stock movement:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}












