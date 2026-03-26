import { createClient } from '@supabase/supabase-js'

/**
 * Crée un client Supabase pour un projet distant
 */
export function createRemoteSupabaseClient(supabaseUrl: string, supabaseAnonKey: string) {
    if (!supabaseUrl || !supabaseAnonKey) return null

    try {
        return createClient(supabaseUrl, supabaseAnonKey)
    } catch (error) {
        console.error('Erreur lors de la création du client Supabase distant:', error)
        return null
    }
}

/**
 * Récupère des métriques de base d'un projet distant
 */
export async function getRemoteMetrics(supabaseUrl: string, supabaseAnonKey: string) {
    const remote = createRemoteSupabaseClient(supabaseUrl, supabaseAnonKey)
    if (!remote) return null

    try {
        // Tentative de récupération du nombre d'utilisateurs (via auth.users si service role, mais ici on teste via une table publique ou auth de base)
        // Note: Sans service role key, on ne peut pas compter les utilisateurs directement dans auth.users.
        // On va essayer de voir si le client est valide et potentiellement interroger une table publique.

        // Pour l'instant, on simule une réponse de santé du client
        return {
            status: 'online',
            timestamp: new Date().toISOString()
        }
    } catch (error) {
        return {
            status: 'offline',
            error: 'Connection failed'
        }
    }
}
