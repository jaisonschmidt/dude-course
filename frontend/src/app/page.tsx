import Link from 'next/link'

// TODO: Expandir para landing page completa (catálogo de cursos, destaques, etc.)
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="mb-4 text-4xl font-bold">Dude Course</h1>
      <p className="mb-10 text-xl text-gray-600">
        Plataforma educacional com cursos estruturados e certificados
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-blue-600 px-6 py-3 text-blue-600 transition-colors hover:bg-blue-50"
        >
          Criar conta
        </Link>
      </div>
    </main>
  )
}
