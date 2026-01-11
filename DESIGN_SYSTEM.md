# 🎨 Design System CK Clinique

## Vue d'ensemble

Le design system CK Clinique utilise des variables CSS personnalisées pour une cohérence visuelle et une maintenance facilitée. Il supporte également le mode sombre.

## 🎨 Couleurs

### Couleurs principales

```css
/* Utilisation dans Tailwind */
bg-primary          /* Couleur primaire */
text-primary-foreground  /* Texte sur fond primaire */

bg-secondary        /* Couleur secondaire */
bg-muted           /* Couleur atténuée */
bg-accent          /* Couleur d'accentuation */
```

### Couleurs sémantiques

```css
/* Succès */
bg-success
text-success-foreground

/* Avertissement */
bg-warning
text-warning-foreground

/* Information */
bg-info
text-info-foreground

/* Destructif/Erreur */
bg-destructive
text-destructive-foreground
```

### Couleurs de la sidebar

```css
bg-sidebar-background
text-sidebar-foreground
bg-sidebar-accent
border-sidebar-border
```

## 📐 Border Radius

Le système utilise une variable `--radius` pour un rayon de bordure cohérent :

```css
rounded-lg    /* var(--radius) = 0.75rem */
rounded-md    /* calc(var(--radius) - 2px) */
rounded-sm    /* calc(var(--radius) - 4px) */
```

## 🌓 Mode sombre

Le design system supporte automatiquement le mode sombre via la classe `.dark` :

```tsx
<div className="dark">
  {/* Contenu en mode sombre */}
</div>
```

## 📦 Composants utilitaires

### Scrollbar personnalisée

```tsx
<div className="scrollbar-thin">
  {/* Contenu avec scrollbar fine */}
</div>
```

### Animations

```tsx
<div className="animate-fade-in">   {/* Apparition en fondu */}
<div className="animate-slide-in"> {/* Glissement depuis la gauche */}
<div className="animate-fade-out">  {/* Disparition en fondu */}
```

### Transitions

```tsx
<div className="transition-smooth">
  {/* Transitions fluides */}
</div>
```

## 🎯 Exemples d'utilisation

### Carte avec hover

```tsx
<div className="card bg-card text-card-foreground rounded-lg p-6">
  Contenu de la carte
</div>
```

### Badge de statut

```tsx
<span className="badge bg-success text-success-foreground">
  Actif
</span>
```

### Input avec focus

```tsx
<input 
  className="border-input rounded-md px-4 py-2 focus:ring-2 focus:ring-ring"
  type="text"
/>
```

### Bouton primaire

```tsx
<button className="bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:opacity-90">
  Cliquer
</button>
```

## 🎨 Variables CSS disponibles

### Couleurs de base
- `--background` : Fond principal
- `--foreground` : Texte principal
- `--card` : Fond des cartes
- `--card-foreground` : Texte sur les cartes
- `--popover` : Fond des popovers
- `--popover-foreground` : Texte sur les popovers

### Couleurs interactives
- `--primary` : Couleur primaire (bleu CK Clinique)
- `--primary-foreground` : Texte sur fond primaire
- `--secondary` : Couleur secondaire
- `--secondary-foreground` : Texte sur fond secondaire
- `--muted` : Couleur atténuée
- `--muted-foreground` : Texte sur fond atténué
- `--accent` : Couleur d'accentuation
- `--accent-foreground` : Texte sur fond accent

### Couleurs sémantiques
- `--destructive` : Erreur/Suppression
- `--success` : Succès
- `--warning` : Avertissement
- `--info` : Information

### Bordures et inputs
- `--border` : Couleur des bordures
- `--input` : Couleur des inputs
- `--ring` : Couleur du focus ring

### Sidebar
- `--sidebar-background` : Fond de la sidebar
- `--sidebar-foreground` : Texte de la sidebar
- `--sidebar-primary` : Couleur primaire sidebar
- `--sidebar-accent` : Accent sidebar
- `--sidebar-border` : Bordure sidebar
- `--sidebar-muted` : Muted sidebar

## 🔧 Personnalisation

Pour modifier les couleurs, éditez les variables dans `app/globals.css` :

```css
:root {
  --primary: 210 100% 50%;  /* Modifier ici */
  /* ... */
}
```

Les valeurs sont en format HSL sans les parenthèses pour permettre l'utilisation avec `hsl(var(--primary))`.

## 📱 Responsive

Le design system inclut des styles responsive automatiques :

```css
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
}
```

## 🖨️ Impression

Les éléments avec la classe `no-print` seront masqués lors de l'impression :

```tsx
<div className="no-print">
  {/* Ne s'affichera pas à l'impression */}
</div>
```

## ♿ Accessibilité

Le design system inclut :
- Styles `:focus-visible` pour la navigation au clavier
- Contraste de couleurs approprié
- Transitions fluides pour les interactions

## 🚀 Migration depuis l'ancien système

Si vous utilisez les anciennes classes `primary-500`, `primary-600`, etc., elles sont toujours disponibles pour la compatibilité. Cependant, il est recommandé d'utiliser les nouvelles variables :

```tsx
// Ancien (toujours fonctionnel)
<div className="bg-primary-500">

// Nouveau (recommandé)
<div className="bg-primary">
```













