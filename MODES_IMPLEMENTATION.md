# Système de Modes - Implémentation

## 📋 Vue d'ensemble

Un système de deux modes a été implémenté pour adapter le visionneur d'images selon le type de carte :

### **Mode Interactive** (`"mode": "interactive"`)
- 📊 Cartes avec **plusieurs images** à explorer
- Navigation avec boutons précédent/suivant
- Galerie de miniatures pour naviguer rapidement
- Affichage du compteur d'images (ex: "3 / 6")
- Titres des figures affichés
- Exemple: **Carte 1 - Carte Interactive du Climat Mondial** (6 images)

### **Mode 2D** (`"mode": "2d"`)
- 🗺️ Cartes avec **une seule image** ou sans images
- Affichage simple et épuré
- Pas de boutons de navigation
- Pas de galerie de miniatures
- Interface minimaliste optimisée
- Exemple: **Cartes 2-17** (navigation uniquement)

---

## 🔧 Fichiers modifiés

### 1. **maps.json** - Structure de données
- ✅ Ajout du champ `"mode"` à toutes les 17 cartes
- **Carte 1**: `"mode": "interactive"` (6 images)
- **Cartes 2-17**: `"mode": "2d"` (1 image ou pas d'images)

### 2. **ImageViewer.js** - Logique du composant
```javascript
// Nouvelle logique conditionnelle
const is2DMode = map && map.mode === '2d' && images.length === 1;

// Affichage conditionnel:
!is2DMode && images.length > 1  // Navigation buttons
!is2DMode                       // Info panel & thumbnails
is2DMode                        // Mode simple full-screen
```

**Changements:**
- Ajout du prop `map` pour accéder au mode
- Boutons de navigation cachés en mode 2D
- Galerie de miniatures cachée en mode 2D
- Compteur d'images caché en mode 2D
- Titre des figures caché en mode 2D

### 3. **MapModal.js** - Passage des props
```javascript
React.createElement(ImageViewer, {
    images: map.images,
    map: map,  // ✅ Nouveau prop
    onClose: () => setViewerOpen(false),
})
```

### 4. **components.css** - Styles adaptatifs
```css
/* Mode 2D - Image unique plein écran */
.viewer-image.mode-2d {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Mode Interactive - Multiples images */
.viewer-image.mode-interactive {
    max-width: 90%;
    max-height: 90%;
}

/* Ajustement du conteneur pour mode 2D */
.image-viewer-container:has(.mode-2d) {
    max-width: 900px;
    max-height: 700px;
}
```

---

## 🎯 Comportement utilisateur

### Pour une carte Interactive (Carte 1)
1. L'utilisateur clique sur une image
2. Le visionneur s'ouvre avec:
   - Image agrandie au centre
   - Boutons **Précédent/Suivant** actifs
   - Miniatures en bas pour navigation rapide
   - Compteur "X / 6"
   - Titres des figures affichés

### Pour une carte 2D (Cartes 2-17)
1. L'utilisateur clique sur l'image
2. Le visionneur s'ouvre avec:
   - Image en mode plein écran
   - ✗ Pas de boutons de navigation
   - ✗ Pas de miniatures
   - ✗ Pas de compteur
   - ✗ Pas de titre de figure
   - Interface épurée et simple

---

## 📊 Répartition des cartes

| Mode | Nombre | Cartes |
|------|--------|--------|
| **Interactive** | 1 | Carte 1 (Climat Mondial) |
| **2D** | 16 | Cartes 2-17 |

---

## ✨ Avantages

✅ **Interface adaptée**: Chaque type de carte a l'interface optimale  
✅ **Expérience utilisateur**: Pas d'éléments inutiles en mode 2D  
✅ **Maintenabilité**: Simple à ajouter d'autres cartes interactives  
✅ **Performance**: Rendu optimisé selon le mode  
✅ **Extensibilité**: Facile d'ajouter d'autres modes (3D, vidéo, etc.)

---

## 🚀 Utilisation future

Pour ajouter une nouvelle carte interactive avec plusieurs images:

```json
{
  "id": 18,
  "mode": "interactive",
  "title": "Ma nouvelle carte interactive",
  "images": [
    { "url": "...", "title": "Image 1" },
    { "url": "...", "title": "Image 2" },
    // ... autres images
  ]
  // ... autres propriétés
}
```

Pour ajouter une carte simple 2D:

```json
{
  "id": 19,
  "mode": "2d",
  "title": "Ma nouvelle carte 2D",
  "thumbnail": "...",
  // ... autres propriétés
}
```
