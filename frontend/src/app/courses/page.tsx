import Link from 'next/link'
import { CourseList } from '@/components/course/CourseList'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { listCourses } from '@/services/course-service'

export const revalidate = 60

interface CoursesPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams
  const currentPage = Math.max(1, Number(params.page) || 1)

  let courses: Awaited<ReturnType<typeof listCourses>>['courses'] = []
  let totalPages = 1
  let error: string | null = null

  try {
    const result = await listCourses(currentPage, 20)
    courses = result.courses
    totalPages = result.meta.totalPages
  } catch {
    error = 'Não foi possível carregar os cursos. Tente novamente mais tarde.'
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Catálogo de Cursos</h1>
        <p className="mt-2 text-gray-600">
          Explore nossos cursos e comece a aprender agora.
        </p>
      </div>

      {error ? (
        <ErrorMessage message={error} />
      ) : (
        <>
          <CourseList courses={courses} />

          {totalPages > 1 && (
            <nav className="mt-8 flex justify-center" aria-label="Paginação do catálogo">
              <div className="flex items-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/courses?page=${currentPage - 1}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    aria-label="Página anterior"
                  >
                    ← Anterior
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={`/courses?page=${currentPage + 1}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    aria-label="Próxima página"
                  >
                    Próxima →
                  </Link>
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </main>
  )
}
