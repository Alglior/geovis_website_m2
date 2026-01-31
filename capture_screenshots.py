#!/usr/bin/env python3
"""
Script pour capturer automatiquement les screenshots des cartes interactives
"""
import json
import os
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

# Configuration
SCRIPT_DIR = Path(__file__).parent
MAPS_JSON = SCRIPT_DIR / 'static' / 'data' / 'maps.json'
THUMBNAILS_DIR = SCRIPT_DIR / 'static' / 'images' / 'thumbnails'
SCREENSHOT_WIDTH = 1200
SCREENSHOT_HEIGHT = 800

async def accept_cookies(page):
    """Tente d'accepter les cookies sur la page"""
    cookie_selectors = [
        'button:has-text("Accept")',
        'button:has-text("Accept all")',
        'button:has-text("Accepter")',
        'button:has-text("Tout accepter")',
        'button:has-text("J\'accepte")',
        'button:has-text("OK")',
        'button:has-text("I agree")',
        'button:has-text("Agree")',
        'button:has-text("Allow")',
        'button:has-text("Allow all")',
        '[id*="accept"]',
        '[class*="accept"]',
        '[class*="cookie"] button',
        '.cookie-consent button',
        '#cookie-consent button',
        'button[aria-label*="Accept"]',
        'button[aria-label*="Accepter"]',
    ]
    
    for selector in cookie_selectors:
        try:
            await page.click(selector, timeout=2000)
            print("  ✓ Cookies acceptés")
            await asyncio.sleep(1)
            return True
        except:
            continue
    return False

async def capture_screenshot(page, url, output_path, map_id):
    """Capture un screenshot d'une URL donnée"""
    try:
        print(f"📸 Capture de la carte {map_id}: {url}")
        
        # Naviguer vers l'URL
        await page.goto(url, wait_until='domcontentloaded', timeout=30000)
        
        # Attendre un peu que le contenu se charge
        await asyncio.sleep(2)
        
        # Tenter d'accepter les cookies
        await accept_cookies(page)
        
        # Attendre que la page se charge complètement
        await asyncio.sleep(3)
        
        # Prendre le screenshot
        await page.screenshot(path=output_path, full_page=False)
        print(f"✅ Screenshot sauvegardé: {output_path}")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la capture de {url}: {str(e)}")
        return False

async def main():
    """Fonction principale"""
    # Créer le dossier thumbnails s'il n'existe pas
    THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Charger les données des cartes
    with open(MAPS_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    maps = data['maps']
    print(f"🗺️  {len(maps)} cartes trouvées")
    print(f"📁 Dossier de sortie: {THUMBNAILS_DIR}")
    print("=" * 60)
    
    async with async_playwright() as p:
        # Lancer le navigateur
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': SCREENSHOT_WIDTH, 'height': SCREENSHOT_HEIGHT},
            locale='fr-FR',
            timezone_id='Europe/Paris',
            user_agent='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        # Bloquer les dialogues et popups
        page.on("dialog", lambda dialog: dialog.dismiss())
        
        success_count = 0
        fail_count = 0
        
        # Parcourir toutes les cartes
        for map_item in maps:
            map_id = map_item['id']
            url = map_item['url']
            output_path = THUMBNAILS_DIR / f"map-{map_id}.png"
            
            # Capturer le screenshot
            if await capture_screenshot(page, url, output_path, map_id):
                success_count += 1
                
                # Mettre à jour le chemin de la thumbnail dans le JSON
                map_item['thumbnail'] = f"/static/images/thumbnails/map-{map_id}.png"
            else:
                fail_count += 1
            
            # Petit délai entre chaque capture
            await asyncio.sleep(2)
        
        await browser.close()
    
    # Sauvegarder le JSON mis à jour
    with open(MAPS_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("=" * 60)
    print(f"✅ Captures réussies: {success_count}")
    print(f"❌ Captures échouées: {fail_count}")
    print(f"📝 Fichier JSON mis à jour: {MAPS_JSON}")
    print("\n🎉 Terminé!")

if __name__ == "__main__":
    asyncio.run(main())
