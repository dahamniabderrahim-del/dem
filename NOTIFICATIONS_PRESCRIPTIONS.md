# 🔔 Système de Notifications pour les Prescriptions

## 📋 Vue d'ensemble

Le système de notifications alerte automatiquement les utilisateurs lorsque des prescriptions sont sur le point d'expirer ou ont déjà expiré.

## ✨ Fonctionnalités

### 1. **Notifications dans le Header**
- Badge avec le nombre de notifications
- Dropdown affichant :
  - Prescriptions expirées (en rouge)
  - Prescriptions à renouveler dans les 7 prochains jours (en jaune)
- Rafraîchissement automatique toutes les 5 minutes

### 2. **Alertes dans le Dashboard**
- Section "Alertes" avec :
  - Nombre de prescriptions expirées
  - Nombre de prescriptions à renouveler
- Mise à jour automatique

### 3. **Calcul automatique de la date d'expiration**
- Calcul basé sur la durée de la prescription (ex: "7 jours", "2 semaines", "1 mois")
- Enregistrement automatique lors de la création d'une prescription

## 🗄️ Structure de la base de données

### Champ ajouté dans `PatientPrescription`:
```prisma
expirationDate DateTime? @map("expiration_date") @db.Date
status         String?   @default("active") // 'active', 'completed', 'cancelled', 'expired'
```

## 📡 API Endpoints

### GET `/api/notifications/prescriptions`
Récupère les prescriptions expirées et à expirer.

**Réponse:**
```json
{
  "expired": [
    {
      "id": "...",
      "patientName": "Jean Dupont",
      "patientId": "...",
      "expirationDate": "2024-01-15",
      "prescribedDate": "2024-01-08",
      "medicaments": "Paracétamol, Ibuprofène",
      "status": "expired"
    }
  ],
  "expiringSoon": [
    {
      "id": "...",
      "patientName": "Marie Martin",
      "patientId": "...",
      "expirationDate": "2024-01-20",
      "prescribedDate": "2024-01-13",
      "medicaments": "Amoxicilline",
      "status": "expiring_soon",
      "daysUntilExpiration": 3
    }
  ],
  "total": 5
}
```

## 🔧 Utilisation

### Dans le code

```typescript
import { notificationService } from '@/services/notificationService';

// Récupérer les notifications
const notifications = await notificationService.getPrescriptionNotifications();
console.log(notifications.expired); // Prescriptions expirées
console.log(notifications.expiringSoon); // Prescriptions à renouveler
```

### Mise à jour des prescriptions existantes

Pour mettre à jour les dates d'expiration des prescriptions existantes qui n'en ont pas :

```bash
# Via l'API (nécessite d'être admin)
POST /api/prescriptions/update-expiration-dates
```

## 📝 Migration de la base de données

Après avoir modifié le schéma Prisma, exécutez :

```bash
# Générer la migration
npm run db:migrate

# Ou pousser directement les changements
npx prisma db push
```

## 🔄 Mise à jour automatique

Le système met automatiquement à jour le statut des prescriptions expirées :
- Lors de l'appel à `/api/notifications/prescriptions`
- Les prescriptions avec `expirationDate < aujourd'hui` sont marquées comme `expired`

## 🎨 Interface utilisateur

### Header
- Badge de notification avec compteur
- Dropdown avec liste des notifications
- Couleurs :
  - 🔴 Rouge pour les prescriptions expirées
  - 🟡 Jaune pour les prescriptions à renouveler

### Dashboard
- Section "Alertes" avec cartes colorées
- Compteurs dynamiques
- Liens vers la page des prescriptions

## 📊 Critères de notification

- **Expirées** : `expirationDate < aujourd'hui` et `status = 'active'`
- **À renouveler** : `expirationDate <= aujourd'hui + 7 jours` et `status = 'active'`

## 🚀 Prochaines améliorations

- [ ] Notifications par email
- [ ] Notifications push
- [ ] Historique des notifications
- [ ] Filtres par patient/médecin
- [ ] Export des rapports d'expiration














