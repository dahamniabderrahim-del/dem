import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// PUT - Mettre à jour un remboursement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user || (user.role !== 'admin' && user.role !== 'receptionniste')) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Réceptionniste requis' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { status, amount, insuranceAmount, notes } = data;

    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'approved' && !data.approvalDate) {
        updateData.approvalDate = new Date();
      }
      if (status === 'paid' && !data.paymentDate) {
        updateData.paymentDate = new Date();
      }
    }
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (insuranceAmount !== undefined) updateData.insuranceAmount = insuranceAmount ? parseFloat(insuranceAmount) : null;
    if (notes !== undefined) updateData.notes = notes;

    const reimbursement = await prisma.reimbursement.update({
      where: { id: params.id },
      data: updateData,
      include: {
        invoice: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(reimbursement);
  } catch (error: any) {
    console.error('Error updating reimbursement:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ message: 'Remboursement non trouvé' }, { status: 404 });
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un remboursement (admin uniquement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 403 }
    );
  }

  try {
    await prisma.reimbursement.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Remboursement supprimé avec succès' });
  } catch (error: any) {
    console.error('Error deleting reimbursement:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ message: 'Remboursement non trouvé' }, { status: 404 });
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}












