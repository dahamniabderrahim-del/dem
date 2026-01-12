import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer une facture par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            address: true,
            insuranceNumber: true,
          },
        },
        appointment: {
          include: {
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { message: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération de la facture' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une facture (admin ou réceptionniste uniquement)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  if (user.role !== 'admin' && user.role !== 'receptionniste') {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Réceptionniste requis' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { amount, status, paymentMethod, insuranceCoverage, notes } = data;

    const updateData: any = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (status !== undefined) updateData.status = status;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (insuranceCoverage !== undefined) updateData.insuranceCoverage = insuranceCoverage ? parseFloat(insuranceCoverage) : null;
    if (notes !== undefined) updateData.notes = notes;

    // Si le statut passe à "paid" et qu'il n'y a pas encore de date de paiement
    if (status === 'paid' && !data.paidAt) {
      updateData.paidAt = new Date();
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        appointment: {
          select: {
            id: true,
            date: true,
            time: true,
          },
        },
      },
    });

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { message: 'Facture non trouvée' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la mise à jour de la facture' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une facture (admin uniquement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  if (user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 403 }
    );
  }

  try {
    await prisma.invoice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Facture supprimée avec succès' });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { message: 'Facture non trouvée' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la suppression de la facture' },
      { status: 500 }
    );
  }
}












