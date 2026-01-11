// Fichier principal pour la connexion à la base de données
// Utilisez cette configuration une fois que vous avez configuré vos variables d'environnement

import { db, query } from './db-pg';

// Exemple d'utilisation des fonctions de base de données

export async function getAllUsers() {
  try {
    const result = await query('SELECT * FROM users');
    return result.rows;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
}

export async function getUserById(id: string) {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur par email:', error);
    throw error;
  }
}

export async function createUser(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  specialty?: string;
}) {
  try {
    const result = await query(
      `INSERT INTO users (email, password, first_name, last_name, role, phone, specialty, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName,
        userData.role,
        userData.phone || null,
        userData.specialty || null,
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    throw error;
  }
}

export async function updateUser(id: string, userData: Partial<{
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  specialty: string;
}>) {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (userData.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(userData.email);
    }
    if (userData.firstName !== undefined) {
      fields.push(`first_name = $${paramIndex++}`);
      values.push(userData.firstName);
    }
    if (userData.lastName !== undefined) {
      fields.push(`last_name = $${paramIndex++}`);
      values.push(userData.lastName);
    }
    if (userData.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(userData.phone);
    }
    if (userData.specialty !== undefined) {
      fields.push(`specialty = $${paramIndex++}`);
      values.push(userData.specialty);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw error;
  }
}

// Export du pool de connexions pour utilisation directe si nécessaire
export { db, query };

























