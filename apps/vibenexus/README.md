# 💻 Application VibeNexus

Ceci est le cœur applicatif de la plateforme VibeNexus, développé avec Next.js 15.

## 🛠️ Pré-requis

- **Node.js** (v20+)
- **NPM** ou **Pnpm**
- Un compte **Supabase**

## 🚀 Installation Rapide

1.  **Installation des dépendances** :
    ```bash
    npm install
    ```

2.  **Configuration des variables d'environnement** :
    Copiez le fichier `.env.local.example` vers `.env.local` et renseignez vos clés Supabase et GitHub.

3.  **Initialisation de la base de données** :
    Exécutez le script SQL présent dans `/infrastructure/vibenexus-db.sql` dans votre éditeur SQL Supabase.

4.  **Lancement du mode développement** :
    ```bash
    npm run dev
    ```

## 🏗️ Structure du Code

- `/src/app` : Routes et pages (App Router).
- `/src/components` : Interface utilisateur (UI) et composants métiers.
- `/src/lib` : Utilitaires, clients API et types TypeScript.
- `/public` : Assets statiques et images capturées par l'agent.

## 🧪 Qualité du Code

- **Linting** : `npm run lint` pour vérifier la conformité aux standards.
- **Build** : `npm run build` pour valider la compilation de production.
