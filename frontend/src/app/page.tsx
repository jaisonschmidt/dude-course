import Link from 'next/link'
import { CourseList } from '@/components/course/CourseList'
import { listCourses } from '@/services/course-service'

export const revalidate = process.env.NODE_ENV === 'production' ? 60 : 0

export default async function HomePage() {
  let featuredCourses: Awaited<ReturnType<typeof listCourses>>['courses'] = []

  try {
    const result = await listCourses(1, 6)
    featuredCourses = result.courses
  } catch {
    // Fail silently — show hero without courses
  }

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">Dude Course</h1>
          <p className="mb-8 text-lg text-blue-100 sm:text-xl">
            Plataforma educacional com cursos estruturados e certificados.
            Aprenda no seu ritmo com conteúdo de qualidade.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/courses"
              className="rounded-lg bg-white px-8 py-3 font-semibold text-blue-700 transition-colors hover:bg-blue-50"
            >
              Explorar Cursos
            </Link>
            <Link
              href="/register"
              className="rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Cursos em Destaque</h2>
          <Link
            href="/courses"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Ver todos →
          </Link>
        </div>
        <CourseList
          courses={featuredCourses}
          emptyMessage="Novos cursos estão chegando em breve!"
        />
      </section>
    </main>
  )
}
