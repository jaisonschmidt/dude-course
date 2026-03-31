import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Dude Course. Todos os direitos reservados.
          </p>
          <nav className="flex gap-6" aria-label="Links do rodapé">
            <Link
              href="/courses"
              className="text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              Catálogo
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              Sobre
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
