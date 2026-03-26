import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
