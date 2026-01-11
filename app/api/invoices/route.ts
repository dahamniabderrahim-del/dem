import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Liste toutes les factures
export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    if (patientId) {
      where.patientId = patientId;
    }
    if (status) {
      where.status = status;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        appointment: {
          select: {
            id: true,
            date: true,
            time: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération des factures' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle facture (admin ou réceptionniste uniquement)
export async function POST(request: NextRequest) {
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
    const { patientId, appointmentId, amount, paymentMethod, insuranceCoverage, notes } = data;

    if (!patientId || !amount) {
      return NextResponse.json(
        { message: 'Le patient et le montant sont requis' },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.create({
      data: {
        patientId,
        appointmentId: appointmentId || null,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || null,
        insuranceCoverage: insuranceCoverage ? parseFloat(insuranceCoverage) : null,
        notes: notes || null,
        status: paymentMethod ? 'paid' : 'pending',
        paidAt: paymentMethod ? new Date() : null,
      },
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

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la création de la facture' },
      { status: 500 }
    );
  }
}












