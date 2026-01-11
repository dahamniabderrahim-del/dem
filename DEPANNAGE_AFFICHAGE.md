# 🔧 Dépannage - Le site n'affiche pas

## Vérifications à faire

### 1. Vérifier que le serveur est démarré

```bash
npm run dev
```

Le serveur doit afficher :
```
✓ Ready in Xs
○ Compiling / ...
✓ Compiled / in Xs
```

### 2. Vérifier l'URL

Ouvrez votre navigateur à l'adresse :
```
http://localhost:3000
```

### 3. Vérifier la console du navigateur

Appuyez sur `F12` dans votre navigateur et regardez l'onglet **Console** pour voir les erreurs.

### 4. Vérifier les erreurs de compilation

Dans le terminal où `npm run dev` est lancé, vérifiez s'il y a des erreurs de compilation.

## Solutions courantes

### Problème : Page blanche

**Solution 1 : Vérifier les imports**
- Assurez-vous que tous les imports sont corrects
- Vérifiez que les composants existent

**Solution 2 : Vérifier le client Prisma**
```bash
npm run db:generate
```

**Solution 3 : Nettoyer et réinstaller**
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Problème : Erreur 404

**Solution :** Vérifiez que vous êtes sur la bonne route :
- `/login` pour la page de connexion
- `/dashboard` pour le tableau de bord (nécessite d'être connecté)

### Problème : Erreur de compilation

**Solution 1 : Vérifier TypeScript**
```bash
npm run build
```

**Solution 2 : Vérifier les erreurs de lint**
```bash
npm run lint
```

### Problème : Erreur "Module not found"

**Solution :** Réinstaller les dépendances
```bash
npm install
```

### Problème : Erreur Prisma

**Solution :** Régénérer le client Prisma
```bash
npm run db:generate
```

Si l'erreur persiste :
```bash
npx prisma db push
npm run db:generate
```

## Script de diagnostic

Exécutez le script `check-site.bat` pour un diagnostic automatique :

```bash
check-site.bat
```

## Vérifications manuelles

### 1. Fichier `.env.local` existe-t-il ?

Créez-le avec :
```env
JWT_SECRET=your-secret-key-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=your-database-url
```

### 2. Le port 3000 est-il libre ?

Si le port 3000 est utilisé, Next.js utilisera automatiquement le port 3001.

### 3. Les dépendances sont-elles installées ?

```bash
npm install
```

### 4. Le client Prisma est-il généré ?

```bash
npm run db:generate
```

## Messages d'erreur courants

### "Cannot find module"
→ Réinstaller les dépendances : `npm install`

### "PrismaClient is not configured"
→ Générer le client : `npm run db:generate`

### "401 Unauthorized"
→ Vérifier que vous êtes connecté ou utiliser un compte de test

### "500 Internal Server Error"
→ Vérifier les logs du serveur dans le terminal

## Contact

Si le problème persiste, vérifiez :
1. Les logs du terminal où `npm run dev` est lancé
2. La console du navigateur (F12)
3. Les erreurs de compilation













