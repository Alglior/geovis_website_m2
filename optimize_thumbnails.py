#!/usr/bin/env python3
"""
Script pour optimiser les thumbnails pour l'affichage rapide sur la page d'accueil.
Crée des versions compressées dans un dossier séparé.
"""
import os
from PIL import Image
from pathlib import Path

# Configuration
SCRIPT_DIR = Path(__file__).parent
THUMBNAILS_DIR = SCRIPT_DIR / 'static' / 'images' / 'thumbnails'
THUMBNAILS_OPTIMIZED_DIR = SCRIPT_DIR / 'static' / 'images' / 'thumbnails-optimized'

# Créer le dossier de sortie s'il n'existe pas
THUMBNAILS_OPTIMIZED_DIR.mkdir(parents=True, exist_ok=True)

# Configuration de compression
TARGET_SIZE = (400, 300)  # Taille pour les cartes
QUALITY = 75  # Qualité JPEG (0-100)
MAX_FILE_SIZE = 100 * 1024  # 100 KB max par thumbnail

def optimize_image(input_path, output_path):
    """Optimise une image pour le web"""
    try:
        with Image.open(input_path) as img:
            # Convertir RGBA en RGB pour PNG->JPEG
            if img.mode in ('RGBA', 'LA', 'P'):
                # Garder PNG pour les images avec transparence
                output_format = 'PNG'
                quality = 85
            else:
                output_format = 'JPEG'
                quality = QUALITY
            
            # Redimensionner avec aspect ratio
            img.thumbnail(TARGET_SIZE, Image.Resampling.LANCZOS)
            
            # Sauvegarder en optimisant
            img.save(
                output_path,
                format=output_format,
                quality=quality,
                optimize=True
            )
            
            original_size = os.path.getsize(input_path)
            optimized_size = os.path.getsize(output_path)
            reduction = ((original_size - optimized_size) / original_size) * 100
            
            return {
                'success': True,
                'original': original_size,
                'optimized': optimized_size,
                'reduction': reduction
            }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def main():
    print("🖼️  Optimisation des thumbnails pour l'accueil...")
    print("=" * 60)
    
    if not THUMBNAILS_DIR.exists():
        print(f"❌ Dossier introuvable: {THUMBNAILS_DIR}")
        return
    
    # Lister tous les fichiers images
    image_files = list(THUMBNAILS_DIR.glob('*.*'))
    image_files = [f for f in image_files if f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.webp']]
    
    if not image_files:
        print("❌ Aucun fichier image trouvé")
        return
    
    print(f"📊 {len(image_files)} images trouvées\n")
    
    total_original = 0
    total_optimized = 0
    success_count = 0
    
    for input_file in sorted(image_files):
        output_file = THUMBNAILS_OPTIMIZED_DIR / input_file.name
        
        result = optimize_image(input_file, output_file)
        
        if result['success']:
            total_original += result['original']
            total_optimized += result['optimized']
            success_count += 1
            
            print(f"✅ {input_file.name}")
            print(f"   {result['original'] / 1024:.1f} KB → {result['optimized'] / 1024:.1f} KB ({result['reduction']:.1f}% réduit)")
        else:
            print(f"❌ {input_file.name}: {result['error']}")
    
    print("\n" + "=" * 60)
    print(f"📈 Résultats:")
    print(f"   Fichiers traités: {success_count}/{len(image_files)}")
    print(f"   Taille totale: {total_original / (1024*1024):.2f} MB → {total_optimized / (1024*1024):.2f} MB")
    reduction_total = ((total_original - total_optimized) / total_original) * 100
    print(f"   Réduction totale: {reduction_total:.1f}%")
    print(f"   Dossier de sortie: {THUMBNAILS_OPTIMIZED_DIR}")

if __name__ == "__main__":
    main()
