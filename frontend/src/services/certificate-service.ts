import { apiRequest } from './api'
import type { Certificate } from './types/certificate'

/**
 * Gera ou retorna o certificado do learner autenticado para um curso concluído.
 * Operação idempotente: se já existir, retorna o existente.
 */
export async function generateCertificate(
  courseId: number,
): Promise<Certificate> {
  const { data } = await apiRequest<Certificate>(
    `/courses/${courseId}/certificate`,
    { method: 'POST' },
  )
  return data
}
