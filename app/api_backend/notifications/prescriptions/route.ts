import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';
import { updateExpiredPrescriptions } from '@/lib/updateExpiredPrescriptions';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Date dans 7 jours
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    // Récupérer les prescriptions via les rendez-vous
    // Les prescriptions sont liées aux rendez-vous, qui sont liés aux patients
    const appointmentsWithPrescriptions = await prisma.appointment.findMany({
      where: {
        prescription: {
          isNot: null,
        },
        date: {
          lte: in7Days, // Rendez-vous dans les 7 prochains jours ou passés
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        prescription: {
          include: {
            medicaments: {
              include: {
                medicament: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Pour l'instant, retourner des notifications basées sur les prescriptions récentes
    // Note: Dans le schéma actuel, les prescriptions n'ont pas de date d'expiration directe
    // Elles sont liées aux rendez-vous, donc on utilise la date du rendez-vous comme référence
    const expired: any[] = [];
    const expiringSoon: any[] = [];

    appointmentsWithPrescriptions.forEach((apt) => {
      if (!apt.prescription) return;
      
      const appointmentDate = new Date(apt.date);
      const daysDiff = Math.ceil((appointmentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      const notification = {
        id: apt.prescription.id,
        patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
        patientId: apt.patient.id,
        appointmentDate: apt.date,
        medicaments: apt.prescription.medicaments.map((pm) => pm.medicament?.name || '').filter(Boolean).join(', ') || 'Aucun médicament',
        status: daysDiff < 0 ? 'expired' : 'expiring_soon',
        daysUntilExpiration: daysDiff >= 0 ? daysDiff : null,
      };

      if (daysDiff < 0) {
        expired.push(notification);
      } else if (daysDiff <= 7) {
        expiringSoon.push(notification);
      }
    });

    return NextResponse.json({
      expired,
      expiringSoon,
      total: expired.length + expiringSoon.length,
    });
  } catch (error: any) {
    console.error('Error fetching prescription notifications:', error);
    // Retourner un objet vide en cas d'erreur pour éviter de casser le dashboard
    return NextResponse.json({
      expired: [],
      expiringSoon: [],
      total: 0,
    });
  }
}

