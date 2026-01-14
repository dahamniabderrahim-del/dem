import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// PATCH - Marquer une notification comme lue
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const notification = await prisma.doctorNotification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return NextResponse.json(
        { message: 'Notification non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le réceptionniste destinataire
    if (user.role === 'receptionniste' && notification.receptionistId !== user.userId) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    const updated = await prisma.doctorNotification.update({
      where: { id: params.id },
      data: { isRead: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la notification' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const notification = await prisma.doctorNotification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return NextResponse.json(
        { message: 'Notification non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le réceptionniste destinataire ou un admin
    if (user.role !== 'admin' && 
        (user.role !== 'receptionniste' || notification.receptionistId !== user.userId)) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    await prisma.doctorNotification.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Notification supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de la notification' },
      { status: 500 }
    );
  }
}













