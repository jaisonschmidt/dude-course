import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DashboardCourseCard } from '../DashboardCourseCard'

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

describe('DashboardCourseCard', () => {
  const defaultProps = {
    courseId: 1,
    title: 'Node.js Fundamentals',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    progress: { completed: 3, total: 10, percentage: 30 },
  }

  it('deve renderizar título do curso', () => {
    render(<DashboardCourseCard {...defaultProps} />)
    expect(screen.getByText('Node.js Fundamentals')).toBeInTheDocument()
  })

  it('deve ter link para o curso', () => {
    render(<DashboardCourseCard {...defaultProps} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/courses/1')
  })

  it('deve exibir thumbnail quando disponível', () => {
    render(<DashboardCourseCard {...defaultProps} />)
    const img = document.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.src).toBe('https://example.com/thumb.jpg')
  })

  it('deve exibir fallback quando sem thumbnail', () => {
    render(<DashboardCourseCard {...defaultProps} thumbnailUrl={null} />)
    expect(screen.getByText('Sem imagem')).toBeInTheDocument()
  })

  it('deve renderizar ProgressBar', () => {
    render(<DashboardCourseCard {...defaultProps} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('deve exibir contagem de aulas', () => {
    render(<DashboardCourseCard {...defaultProps} />)
    expect(screen.getByText('3/10 aulas concluídas')).toBeInTheDocument()
  })
})
