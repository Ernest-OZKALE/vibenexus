# 🏗️ Architecture Technique — VibeNexus

Ce document détaille les choix technologiques et les patterns de conception adoptés pour VibeNexus.

## 🛠️ Stack Technologique

| Couche | Technologie | Justification |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router) | Performance SSR/ISR et routing moderne. |
| **Langage** | TypeScript | Sécurité du typage et maintenabilité à long terme. |
| **Style** | Tailwind CSS | Flexibilité totale et design system atomique. |
| **Backend / DB** | Supabase (PostgreSQL) | Backend-as-a-Service avec RLS et temps réel natif. |
| **Animations** | Framer Motion | Expérience utilisateur fluide et premium. |
| **Icons** | Lucide React | Bibliothèque d'icônes vectoriels légère. |

## 🧩 Patterns de Conception

### 1. Composants Atomes & Molécules
L'interface est découpée en composants réutilisables localisés dans `src/components/ui`. Chaque composant suit une logique de responsabilité unique.

### 2. Sécurité au Niveau des Lignes (RLS)
Plutôt que de gérer la complexité de l'autorisation dans le code applicatif, nous déléguons la sécurité à la base de données via PostgreSQL RLS. Cela garantit que chaque utilisateur n'accède qu'à ses propres données, même en cas de faille client.

### 3. Gestion d'État Optimiste
Pour une sensation de rapidité "Elite", les actions (ajout d'idées, changement de statut) utilisent des mises à jour optimistes via React, synchronisées en arrière-plan avec Supabase.

## 📈 Évolutivité
Le passage en structure **Monorepo** permet d'envisager sereinement l'ajout de nouveaux services (ex: une CLI de maintenance, un service d'indexation vectorielle séparé) sans polluer le code de l'application principale.
