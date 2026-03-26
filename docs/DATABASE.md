# 🗄️ Architecture des Données

VibeNexus utilise une base de données PostgreSQL hébergée sur **Supabase**. Le schéma est conçu pour être à la fois flexible et robuste.

## 🗺️ Entités Principales

### 1. Projets (`projects`)
L'entité centrale. Elle suit le cycle de vie de chaque application, du stade d'idéation jusqu'à la mise en ligne ou l'archivage ("Cimetière").

### 2. Le Frigo à Idées (`ideas`)
Permet de stocker des concepts bruts. Une idée peut être convertie en projet réel, assurant une traçabilité de l'innovation.

### 3. Journal & Logs (`logs`)
Un flux chronologique pour chaque projet. Utilisé pour générer les résumés IA et conserver un historique des décisions techniques.

### 4. Stack Tech (`tech_stack` & `project_tech`)
Une cartographie précise des technologies utilisées par projet, permettant de détecter les versions obsolètes et la dette technique.

## 🔐 Sécurité & Infrastructure

- **Secrets Mappés** : Nous suivons une politique de "Zero Trust" pour les secrets. La table `mapped_secrets` répertorie uniquement les *clés* nécessaires (ex: `STRIPE_API_KEY`) mais jamais les valeurs. Les valeurs résident exclusivement dans les variables d'environnement chiffrées.
- **RLS (Row Level Security)** : Chaque table possède des politiques d'accès strictes définies dans le fichier SQL d'infrastructure.

## 🚀 Migration
Le schéma complet est disponible et versionné dans : [`/infrastructure/vibenexus-db.sql`](../infrastructure/vibenexus-db.sql)
