import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-7xl font-bold text-gray-200">404</div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Página não encontrada
      </h1>
      <p className="mb-6 max-w-md text-gray-600">
        A página que você procura não existe ou foi removida.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
      >
        Voltar para o início
      </Link>
    </div>
  )
}
