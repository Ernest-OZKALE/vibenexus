-- ===========================================
-- VibeNexus — Schéma de Base de Données
-- Architecture d'Élite pour Supabase
-- ===========================================

-- Table centrale des Projets
-- Gère le cycle de vie complet des applications
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'idéation' CHECK (status IN ('idéation', 'vibecoding', 'stable', 'hibernation', 'cimetière')),
    tech_debt_score INT DEFAULT 0 CHECK (tech_debt_score BETWEEN 0 AND 10),
    repo_url VARCHAR(255),
    deploy_url VARCHAR(255),
    is_zombie BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table du "Frigo à Idées"
-- Système de capture de concepts avant transformation en projet
CREATE TABLE ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'brut' CHECK (status IN ('brut', 'validé', 'rejeté', 'converti_en_projet')),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des Logs ("Journal de Bord" & "Capsule Temporelle")
-- Historique technique et décisions d'architecture (ADR)
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    log_type VARCHAR(50) DEFAULT 'journal' CHECK (log_type IN ('journal', 'prochaine_etape', 'erreur_critique')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des Technologies ("Radar d'Obsolescence")
-- Référentiel des compétences et outils utilisés
CREATE TABLE tech_stack (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50)
);

-- Table de liaison Projets <-> Technologies
CREATE TABLE project_tech (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    tech_id UUID REFERENCES tech_stack(id) ON DELETE CASCADE,
    version_used VARCHAR(50),
    PRIMARY KEY (project_id, tech_id)
);

-- Table "Cartographie des Variables"
-- Documente les besoins en secrets sans les stocker (Sécurité Exceptionnelle)
CREATE TABLE mapped_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table "Boutique de Composants"
-- Bibliothèque de composants réutilisables issus de projets passés
CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    code_snippet TEXT NOT NULL,
    language VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- Sécurité RLS (Row Level Security)
-- ===========================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tech ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapped_secrets ENABLE ROW LEVEL SECURITY;

-- Politiques : Contrôle d'accès strict
CREATE POLICY "Utilisateurs peuvent gérer leurs projets" ON projects FOR ALL USING (true);
CREATE POLICY "Utilisateurs peuvent gérer leurs idées" ON ideas FOR ALL USING (true);
CREATE POLICY "Utilisateurs peuvent gérer leurs logs" ON logs FOR ALL USING (true);
CREATE POLICY "Utilisateurs peuvent gérer le stack tech" ON tech_stack FOR ALL USING (true);
CREATE POLICY "Utilisateurs peuvent gérer les technos projet" ON project_tech FOR ALL USING (true);
CREATE POLICY "Utilisateurs peuvent gérer leurs composants" ON components FOR ALL USING (true);
CREATE POLICY "Utilisateurs peuvent gérer leurs secrets" ON mapped_secrets FOR ALL USING (true);
