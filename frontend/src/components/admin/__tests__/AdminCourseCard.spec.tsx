import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminCourseCard } from '../AdminCourseCard'
import type { Course } from '@/services/types/course'

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

const baseCourse: Course = {
  id: 1,
  title: 'Node.js Fundamentals',
  description: 'Learn Node.js',
  thumbnailUrl: null,
  status: 'draft',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('AdminCourseCard', () => {
  const onPublish = vi.fn()
  const onUnpublish = vi.fn()
  const onDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar título do curso', () => {
    render(
      <AdminCourseCard
        course={baseCourse}
        onPublish={onPublish}
        onUnpublish={onUnpublish}
        onDelete={onDelete}
      />,
    )
    expect(screen.getByText('Node.js Fundamentals')).toBeInTheDocument()
  })

  it('deve exibir badge de status', () => {
    render(
      <AdminCourseCard
        course={baseCourse}
        onPublish={onPublish}
        onUnpublish={onUnpublish}
        onDelete={onDelete}
      />,
    )
    expect(screen.getByText('Rascunho')).toBeInTheDocument()
  })

  it('deve exibir botão Publicar para curso draft', () => {
    render(
      <AdminCourseCard
        course={baseCourse}
        onPublish={onPublish}
        onUnpublish={onUnpublish}
        onDelete={onDelete}
      />,
    )
    expect(screen.getByRole('button', { name: /publicar/i })).toBeInTheDocument()
  })

  it('deve exibir botão Despublicar para curso published', () => {
    render(
      <AdminCourseCard
        course={{ ...baseCourse, status: 'published' }}
        onPublish={onPublish}
        onUnpublish={onUnpublish}
        onDelete={onDelete}
      />,
    )
    expect(screen.getByRole('button', { name: /despublicar/i })).toBeInTheDocument()
  })

  it('deve chamar onPublish ao clicar Publicar', async () => {
    render(
      <AdminCourseCard
        course={baseCourse}
        onPublish={onPublish}
        onUnpublish={onUnpublish}
        onDelete={onDelete}
      />,
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /publicar/i }))
    expect(onPublish).toHaveBeenCalledWith(1)
  })

  it('deve chamar onDelete ao clicar Deletar', async () => {
    render(
      <AdminCourseCard
        course={baseCourse}
        onPublish={onPublish}
        onUnpublish={onUnpublish}
        onDelete={onDelete}
      />,
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /deletar/i }))
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  it('deve ter links de Editar e Aulas', () => {
    render(
      <AdminCourseCard
        course={baseCourse}
        onPublish={onPublish}
        onUnpublish={onUnpublish}
        onDelete={onDelete}
      />,
    )
    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('/admin/courses/1/edit')
    expect(hrefs).toContain('/admin/courses/1/lessons')
  })
})
