'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { DashboardCourseCard, CertificateCard, DashboardStats } from '@/components/dashboard'
import { getDashboard } from '@/services/dashboard-service'
import { generateCertificate } from '@/services/certificate-service'
import type { Dashboard, DashboardCertificate } from '@/services/types/dashboard'

function DashboardContent() {
  const { isAuthenticated } = useAuth()
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingCertFor, setGeneratingCertFor] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    async function fetchDashboard() {
      try {
        const data = await getDashboard()
        setDashboard(data)
      } catch {
        setError('Não foi possível carregar o dashboard.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [isAuthenticated])

  const handleGenerateCertificate = useCallback(async (courseId: number, courseTitle: string) => {
    setGeneratingCertFor(courseId)
    try {
      const cert = await generateCertificate(courseId)
      setDashboard((prev) => {
        if (!prev) return prev
        const alreadyHas = prev.certificates.some((c) => c.courseId === courseId)
        if (alreadyHas) return prev
        const newCert: DashboardCertificate = {
          courseId,
          title: courseTitle,
          certificateCode: cert.certificateCode,
          issuedAt: cert.issuedAt,
        }
        return { ...prev, certificates: [...prev.certificates, newCert] }
      })
    } catch {
      setError('Não foi possível gerar o certificado.')
    } finally {
      setGeneratingCertFor(null)
    }
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!dashboard) return <ErrorMessage message="Dashboard não disponível." />

  const hasCertificateFor = (courseId: number) =>
    dashboard.certificates.some((c) => c.courseId === courseId)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Meu Dashboard</h1>

      <DashboardStats
        totalInProgress={dashboard.inProgress.length}
        totalCompleted={dashboard.completed.length}
        totalCertificates={dashboard.certificates.length}
      />

      {/* Em Progresso */}
      <section className="mt-8" data-testid="dashboard-in-progress">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Em Progresso</h2>
        {dashboard.inProgress.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">Você ainda não começou nenhum curso.</p>
            <Link
              href="/courses"
              className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              Explorar Cursos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboard.inProgress.map((course) => (
              <DashboardCourseCard
                key={course.courseId}
                courseId={course.courseId}
                title={course.title}
                thumbnailUrl={course.thumbnailUrl}
                progress={course.progress}
              />
            ))}
          </div>
        )}
      </section>

      {/* Concluídos */}
      <section className="mt-8" data-testid="dashboard-completed">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Concluídos</h2>
        {dashboard.completed.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">Você ainda não concluiu nenhum curso.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dashboard.completed.map((course) => (
              <div
                key={course.courseId}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">{course.title}</h4>
                  <p className="text-sm text-gray-500">
                    Concluído em{' '}
                    {new Date(course.completedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {hasCertificateFor(course.courseId) ? (
                  <span className="rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    ✓ Certificado Emitido
                  </span>
                ) : (
                  <button
                    onClick={() => handleGenerateCertificate(course.courseId, course.title)}
                    disabled={generatingCertFor === course.courseId}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {generatingCertFor === course.courseId ? 'Gerando...' : 'Gerar Certificado'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Certificados */}
      <section className="mt-8" data-testid="dashboard-certificates">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Certificados</h2>
        {dashboard.certificates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">Você ainda não possui certificados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dashboard.certificates.map((cert) => (
              <CertificateCard
                key={cert.certificateCode}
                certificateCode={cert.certificateCode}
                courseName={cert.title}
                issuedAt={cert.issuedAt}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
