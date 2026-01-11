# 🔐 Permissions pour les Rendez-vous

## 📋 Règles d'Autorisation

### ✅ Utilisateurs autorisés à **MODIFIER** les rendez-vous :
- ✅ **Admin** (`admin`)
- ✅ **Médecin** (`medecin`)
- ✅ **Réceptionniste** (`receptionniste`)

### ❌ Utilisateurs **NON autorisés** à modifier :
- ❌ **Infirmier** (`infirmier`) - Peut uniquement **lire** les rendez-vous

## 🔑 Fonctionnalités par Utilisateur

### Admin (`admin`)
- ✅ **Créer** des rendez-vous
- ✅ **Lire** tous les rendez-vous
- ✅ **Modifier** tous les rendez-vous
- ✅ **Supprimer** tous les rendez-vous
- ✅ **Annuler** tous les rendez-vous

### Médecin (`medecin`)
- ✅ **Créer** des rendez-vous
- ✅ **Lire** tous les rendez-vous
- ✅ **Modifier** tous les rendez-vous
- ✅ **Supprimer** tous les rendez-vous
- ✅ **Annuler** tous les rendez-vous

### Réceptionniste (`receptionniste`)
- ✅ **Créer** des rendez-vous
- ✅ **Lire** tous les rendez-vous
- ✅ **Modifier** tous les rendez-vous
- ✅ **Supprimer** tous les rendez-vous
- ✅ **Annuler** tous les rendez-vous

### Infirmier (`infirmier`)
- ✅ **Lire** tous les rendez-vous
- ❌ **Créer** des rendez-vous (interdit)
- ❌ **Modifier** des rendez-vous (interdit)
- ❌ **Supprimer** des rendez-vous (interdit)
- ❌ **Annuler** des rendez-vous (interdit)

## 📡 Routes API

### GET `/api/appointments`
- **Permission requise** : Authentification (tous les rôles)
- **Fonction** : Liste tous les rendez-vous
- **Paramètres de filtre** :
  - `?date=YYYY-MM-DD` - Filtrer par date
  - `?doctorId=xxx` - Filtrer par médecin
  - `?patientId=xxx` - Filtrer par patient

### POST `/api/appointments`
- **Permission requise** : `admin`, `medecin`, ou `receptionniste`
- **Fonction** : Créer un nouveau rendez-vous
- **Corps de la requête** :
  ```json
  {
    "patientId": "uuid",
    "doctorId": "uuid",
    "date": "2024-12-20",
    "time": "09:00",
    "duration": 30,
    "reason": "Consultation",
    "notes": "Notes optionnelles",
    "status": "scheduled"
  }
  ```

### GET `/api/appointments/[id]`
- **Permission requise** : Authentification (tous les rôles)
- **Fonction** : Obtenir un rendez-vous par ID

### PUT `/api/appointments/[id]`
- **Permission requise** : `admin`, `medecin`, ou `receptionniste`
- **Fonction** : Modifier complètement un rendez-vous

### PATCH `/api/appointments/[id]`
- **Permission requise** : `admin`, `medecin`, ou `receptionniste`
- **Fonction** : Modifier partiellement un rendez-vous

### PATCH `/api/appointments/[id]/cancel`
- **Permission requise** : `admin`, `medecin`, ou `receptionniste`
- **Fonction** : Annuler un rendez-vous (change le statut à `cancelled`)

### DELETE `/api/appointments/[id]`
- **Permission requise** : `admin`, `medecin`, ou `receptionniste`
- **Fonction** : Supprimer un rendez-vous

## 🔒 Implémentation

### Fonction de vérification

La vérification des permissions est effectuée par la fonction `verifyAppointmentModification()` dans `lib/appointmentHelpers.ts` :

```typescript
export function verifyAppointmentModification(request: NextRequest): AuthUser | null {
  // Vérifie le token JWT
  // Vérifie que le rôle est admin, medecin ou receptionniste
  // Retourne null si non autorisé
}
```

### Réponses d'erreur

Si un utilisateur non autorisé tente de modifier un rendez-vous :

```json
{
  "message": "Non autorisé - Seuls les administrateurs, médecins et réceptionnistes peuvent modifier des rendez-vous",
  "status": 403
}
```

## 📝 Exemples d'utilisation

### Créer un rendez-vous (Admin/Médecin/Réceptionniste)

```typescript
const response = await fetch('/api/appointments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    patientId: 'patient-uuid',
    doctorId: 'doctor-uuid',
    date: '2024-12-25',
    time: '14:30',
    duration: 45,
    reason: 'Consultation de suivi'
  })
});
```

### Lire les rendez-vous (Tous les rôles)

```typescript
const response = await fetch('/api/appointments?date=2024-12-25', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Annuler un rendez-vous (Admin/Médecin/Réceptionniste)

```typescript
const response = await fetch('/api/appointments/appointment-uuid/cancel', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## ✅ Vérification Frontend

Pour vérifier les permissions côté frontend :

```typescript
import { useAuthStore } from '@/store/authStore';

const user = useAuthStore((state) => state.user);
const canModifyAppointments = user && ['admin', 'medecin', 'receptionniste'].includes(user.role);

if (canModifyAppointments) {
  // Afficher les boutons de modification
} else {
  // Afficher uniquement en lecture seule
}
```

## 🔄 Migration depuis l'ancien système

Si vous utilisez l'ancien système de mock data :
1. Les routes utilisent maintenant Prisma
2. L'authentification est obligatoire pour toutes les routes
3. Les modifications nécessitent un rôle spécifique
4. Les erreurs 403 sont retournées pour les utilisateurs non autorisés

























