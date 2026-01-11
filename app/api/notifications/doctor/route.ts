import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer les notifications pour un réceptionniste
export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const receptionistId = searchParams.get('receptionistId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where: any = {};
    
    if (receptionistId) {
      where.receptionistId = receptionistId;
    } else if (user.role === 'receptionniste') {
      // Si c'est un réceptionniste, récupérer ses propres notifications
      where.receptionistId = user.id;
    }

    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.doctorNotification.findMany({
      where,
      include: {
        appointment: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
}

// POST - Créer une notification (médecin vers réceptionniste)
export async function POST(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  // Seuls les médecins peuvent créer des notifications
  if (user.role !== 'medecin') {
    return NextResponse.json(
      { message: 'Non autorisé - Seuls les médecins peuvent créer des notifications' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { appointmentId, type, message } = data;

    if (!appointmentId || !type) {
      return NextResponse.json(
        { message: 'L\'ID du rendez-vous et le type sont requis' },
        { status: 400 }
      );
    }

    // Récupérer le rendez-vous pour obtenir le réceptionniste
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        receptionist: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { message: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }

    if (!appointment.receptionistId) {
      return NextResponse.json(
        { message: 'Aucun réceptionniste assigné à ce rendez-vous' },
        { status: 400 }
      );
    }

    // Vérifier que le médecin est bien celui du rendez-vous
    if (appointment.doctorId !== user.id) {
      return NextResponse.json(
        { message: 'Vous n\'êtes pas le médecin assigné à ce rendez-vous' },
        { status: 403 }
      );
    }

    const notification = await prisma.doctorNotification.create({
      data: {
        appointmentId,
        doctorId: user.id,
        receptionistId: appointment.receptionistId,
        type,
        message: message || null,
      },
      include: {
        appointment: {
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
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    console.log('✅ Notification créée avec succès:', notification.id);

    return NextResponse.json(notification, { status: 201 });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la notification' },
      { status: 500 }
    );
  }
}












