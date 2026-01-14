# 📍 Où se trouve la table des médecins ?

## 🎯 Réponse courte

**Les médecins sont dans la table `users` avec `role = 'medecin'`**

Il n'y a **pas de table séparée** pour les médecins. Tous les utilisateurs (admin, médecins, réceptionnistes, infirmiers) sont dans la même table `users`.

## 📊 Structure de la base de données

### Table `users` (Table principale)

Cette table contient **TOUS** les utilisateurs :

```sql
CREATE TABLE "users" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" UserRole NOT NULL,  -- 'admin', 'medecin', 'receptionniste', 'infirmier'
    "phone" TEXT,
    "specialty" TEXT,  -- Utilisé uniquement pour les médecins
    "created_at" TIMESTAMP,
    "updated_at" TIMESTAMP
);
```

### Comment identifier un médecin ?

Un médecin est un utilisateur avec :
- `role = 'medecin'`
- `specialty` peut être rempli (ex: "Cardiologie", "Médecine Générale")

## 🔍 Requêtes pour récupérer les médecins

### Avec Prisma (ORM) :

```typescript
// Récupérer TOUS les médecins
const doctors = await prisma.user.findMany({
  where: {
    role: 'medecin'
  }
});

// Récupérer un médecin spécifique
const doctor = await prisma.user.findFirst({
  where: {
    id: doctorId,
    role: 'medecin'
  }
});
```

### Avec SQL direct :

```sql
-- Tous les médecins
SELECT * FROM users WHERE role = 'medecin';

-- Médecin avec sa spécialité
SELECT id, first_name, last_name, email, specialty 
FROM users 
WHERE role = 'medecin';
```

## ✅ Routes API mises à jour

Les routes suivantes utilisent maintenant Prisma pour accéder aux médecins dans la table `users` :

- ✅ `GET /api/doctors` - Liste tous les médecins (depuis `users` où `role='medecin'`)
- ✅ `POST /api/doctors` - Crée un médecin dans la table `users`
- ✅ `GET /api/doctors/[id]` - Récupère un médecin depuis `users`
- ✅ `PUT /api/doctors/[id]` - Met à jour un médecin dans `users`
- ✅ `DELETE /api/doctors/[id]` - Supprime un médecin de `users`

## 💡 Pourquoi cette architecture ?

1. **Évite la duplication** : Les médecins partagent les mêmes champs de base que les autres utilisateurs
2. **Gestion unifiée** : Authentification et gestion des rôles centralisée
3. **Flexibilité** : Facile d'ajouter de nouveaux rôles sans créer de nouvelles tables
4. **Relations simples** : Les relations (patients, rendez-vous) pointent vers la même table `users`

## 📝 Résumé

| Table | Contenu |
|-------|---------|
| `users` | **TOUS** les utilisateurs (admin, médecins, réceptionnistes, infirmiers) |
| `patients` | Patients de la clinique |
| `appointments` | Rendez-vous médicaux |

**Les médecins sont dans `users` avec `role = 'medecin'` ✅**


























