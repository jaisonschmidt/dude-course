import { apiRequest } from './api'
import type { Dashboard } from './types/dashboard'

/**
 * Retorna o dashboard do learner autenticado com cursos em progresso,
 * concluídos e certificados emitidos.
 */
export async function getDashboard(): Promise<Dashboard> {
  const { data } = await apiRequest<Dashboard>('/me/dashboard')
  return data
}
