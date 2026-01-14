import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export interface UserResult {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'medecin' | 'receptionniste' | 'infirmier';
  phone?: string | null;
  specialty?: string | null;
}

/**
 * Recherche un utilisateur par email dans toutes les tables
 */
export async function findUserByEmail(email: string): Promise<UserResult | null> {
  // Chercher dans toutes les tables
  const [admin, doctor, nurse, receptionist] = await Promise.all([
    prisma.admin.findUnique({ where: { email } }),
    prisma.doctor.findUnique({ where: { email } }),
    prisma.nurse.findUnique({ where: { email } }),
    prisma.receptionist.findUnique({ where: { email } }),
  ]);

  if (admin) {
    return {
      id: admin.id,
      email: admin.email,
      password: admin.password,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: 'admin',
      phone: admin.phone,
    };
  }

  if (doctor) {
    return {
      id: doctor.id,
      email: doctor.email,
      password: doctor.password,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      role: 'medecin',
      phone: doctor.phone,
      specialty: doctor.specialty,
    };
  }

  if (nurse) {
    return {
      id: nurse.id,
      email: nurse.email,
      password: nurse.password,
      firstName: nurse.firstName,
      lastName: nurse.lastName,
      role: 'infirmier',
      phone: nurse.phone,
    };
  }

  if (receptionist) {
    return {
      id: receptionist.id,
      email: receptionist.email,
      password: receptionist.password,
      firstName: receptionist.firstName,
      lastName: receptionist.lastName,
      role: 'receptionniste',
      phone: receptionist.phone,
    };
  }

  return null;
}

/**
 * Vérifie le mot de passe
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Récupère un utilisateur par ID et rôle
 */
export async function findUserByIdAndRole(
  id: string,
  role: 'admin' | 'medecin' | 'receptionniste' | 'infirmier'
): Promise<Omit<UserResult, 'password'> | null> {
  switch (role) {
    case 'admin': {
      const admin = await prisma.admin.findUnique({ where: { id } });
      if (!admin) return null;
      return {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: 'admin',
        phone: admin.phone,
      };
    }
    case 'medecin': {
      const doctor = await prisma.doctor.findUnique({ where: { id } });
      if (!doctor) return null;
      return {
        id: doctor.id,
        email: doctor.email,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        role: 'medecin',
        phone: doctor.phone,
        specialty: doctor.specialty,
      };
    }
    case 'infirmier': {
      const nurse = await prisma.nurse.findUnique({ where: { id } });
      if (!nurse) return null;
      return {
        id: nurse.id,
        email: nurse.email,
        firstName: nurse.firstName,
        lastName: nurse.lastName,
        role: 'infirmier',
        phone: nurse.phone,
      };
    }
    case 'receptionniste': {
      const receptionist = await prisma.receptionist.findUnique({ where: { id } });
      if (!receptionist) return null;
      return {
        id: receptionist.id,
        email: receptionist.email,
        firstName: receptionist.firstName,
        lastName: receptionist.lastName,
        role: 'receptionniste',
        phone: receptionist.phone,
      };
    }
    default:
      return null;
  }
}

