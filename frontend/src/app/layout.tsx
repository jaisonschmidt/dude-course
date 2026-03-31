import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { LayoutShell } from './layout-shell'

export const metadata: Metadata = {
  title: 'Dude Course',
  description:
    'Plataforma educacional que transforma conteúdo gratuito do YouTube em cursos estruturados com progresso rastreável e emissão de certificados.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  )
}
