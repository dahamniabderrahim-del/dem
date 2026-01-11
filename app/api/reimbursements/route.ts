import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Liste tous les remboursements
export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');
    const status = searchParams.get('status');

    const where: any = {};
    if (invoiceId) where.invoiceId = invoiceId;
    if (status) where.status = status;

    const reimbursements = await prisma.reimbursement.findMany({
      where,
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
      orderBy: { requestDate: 'desc' },
    });

    return NextResponse.json(reimbursements);
  } catch (error: any) {
    console.error('Error fetching reimbursements:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau remboursement
export async function POST(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user || (user.role !== 'admin' && user.role !== 'receptionniste')) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Réceptionniste requis' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { invoiceId, amount, insuranceAmount, notes } = data;

    if (!invoiceId || !amount) {
      return NextResponse.json(
        { message: 'La facture et le montant sont requis' },
        { status: 400 }
      );
    }

    const reimbursement = await prisma.reimbursement.create({
      data: {
        invoiceId,
        amount: parseFloat(amount),
        insuranceAmount: insuranceAmount ? parseFloat(insuranceAmount) : null,
        notes: notes || null,
        status: 'pending',
      },
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

    return NextResponse.json(reimbursement, { status: 201 });
  } catch (error: any) {
    console.error('Error creating reimbursement:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}












