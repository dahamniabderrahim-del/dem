import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Rapports financiers
export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user || (user.role !== 'admin' && user.role !== 'receptionniste')) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Réceptionniste requis' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
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

    // Factures
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Remboursements
    const reimbursements = await prisma.reimbursement.findMany({
      where: {
        requestDate: startDate || endDate ? {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          ...(endDate ? { lte: new Date(endDate) } : {}),
        } : undefined,
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

    // Calculs
    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalPaid = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalPending = invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalReimbursed = reimbursements
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const totalReimbursementsPending = reimbursements
      .filter(r => r.status === 'pending' || r.status === 'approved')
      .reduce((sum, r) => sum + Number(r.amount), 0);

    // Par méthode de paiement
    const byPaymentMethod = invoices
      .filter(inv => inv.status === 'paid' && inv.paymentMethod)
      .reduce((acc: any, inv) => {
        const method = inv.paymentMethod || 'Autre';
        acc[method] = (acc[method] || 0) + Number(inv.amount);
        return acc;
      }, {});

    // Par mois
    const byMonth = invoices.reduce((acc: any, inv) => {
      const month = new Date(inv.createdAt).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { invoiced: 0, paid: 0, pending: 0 };
      }
      acc[month].invoiced += Number(inv.amount);
      if (inv.status === 'paid') {
        acc[month].paid += Number(inv.amount);
      } else if (inv.status === 'pending') {
        acc[month].pending += Number(inv.amount);
      }
      return acc;
    }, {});

    return NextResponse.json({
      summary: {
        totalInvoiced,
        totalPaid,
        totalPending,
        totalReimbursed,
        totalReimbursementsPending,
        netRevenue: totalPaid - totalReimbursed,
      },
      byPaymentMethod,
      byMonth,
      invoices: invoices.length,
      reimbursements: reimbursements.length,
    });
  } catch (error: any) {
    console.error('Error generating financial report:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la génération du rapport' },
      { status: 500 }
    );
  }
}












