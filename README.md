# Scan PLV pour GitHub Pages

Cette édition est statique et compatible avec GitHub Pages. Le scan, les formulaires, la sauvegarde locale et l’export PDF fonctionnent dans le navigateur.

## Mise en ligne

1. Crée un dépôt GitHub public et téléverse **le contenu de ce dossier** à la racine (notamment `index.html`, `.nojekyll`, `scanner.html`, les fichiers JS et `banner-assets/`).
2. Ouvre **Settings → Pages** dans le dépôt.
3. Sous **Build and deployment**, choisis **Deploy from a branch**, puis `main` et `/(root)`, et enregistre.
4. GitHub affichera l’adresse du site dans cette page après publication.

GitHub Pages ne peut pas exécuter le serveur `/api/product`. Cette version utilise donc le lecteur Castorama public côté navigateur pour chercher un produit par EAN. Ce service peut limiter ou interrompre les requêtes ; si la recherche échoue, les champs restent modifiables manuellement. Les données de la demande sont sauvegardées uniquement dans le navigateur de chaque appareil.
