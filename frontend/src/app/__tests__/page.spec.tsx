/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, ...rest } = props
    return <img {...rest} data-fill={fill ? 'true' : undefined} />
  },
}))

vi.mock('@/services/course-service', () => ({
  listCourses: vi.fn().mockResolvedValue({
    courses: [
      {
        id: 1,
        title: 'Curso de Teste',
        description: 'Descrição do curso',
        thumbnailUrl: null,
        status: 'published',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    meta: { page: 1, pageSize: 6, totalItems: 1, totalPages: 1 },
  }),
}))

import HomePage from '../page'

describe('HomePage', () => {
  it('deve renderizar sem crash', async () => {
    const Page = await HomePage()
    render(Page)
  })

  it('deve exibir o título "Dude Course"', async () => {
    const Page = await HomePage()
    render(Page)
    expect(screen.getByRole('heading', { name: /dude course/i })).toBeInTheDocument()
  })

  it('deve exibir link para explorar cursos', async () => {
    const Page = await HomePage()
    render(Page)
    expect(screen.getByRole('link', { name: /explorar cursos/i })).toHaveAttribute('href', '/courses')
  })

  it('deve exibir link para criar conta', async () => {
    const Page = await HomePage()
    render(Page)
    expect(screen.getByRole('link', { name: /criar conta/i })).toHaveAttribute('href', '/register')
  })

  it('deve exibir seção de cursos em destaque', async () => {
    const Page = await HomePage()
    render(Page)
    expect(screen.getByText('Cursos em Destaque')).toBeInTheDocument()
  })

  it('deve renderizar cursos quando disponíveis', async () => {
    const Page = await HomePage()
    render(Page)
    expect(screen.getByText('Curso de Teste')).toBeInTheDocument()
  })
})
