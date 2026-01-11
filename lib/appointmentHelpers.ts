import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'admin' | 'medecin' | 'receptionniste' | 'infirmier';
}

/**
 * Vérifie si l'utilisateur est authentifié et peut modifier les rendez-vous
 * Seuls admin, medecin et receptionniste peuvent modifier
 */
export function verifyAppointmentModification(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    ) as AuthUser;

    // Seuls admin, medecin et receptionniste peuvent modifier les rendez-vous
    const allowedRoles: AuthUser['role'][] = ['admin', 'medecin', 'receptionniste'];
    if (!allowedRoles.includes(decoded.role)) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Vérifie si l'utilisateur est authentifié (pour la lecture)
 */
export function verifyAuth(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    ) as AuthUser;

    return decoded;
  } catch {
    return null;
  }
}





