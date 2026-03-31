import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LessonItem } from '../LessonItem'

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

describe('LessonItem', () => {
  it('deve renderizar título da aula', () => {
    render(<LessonItem courseId={1} lessonId={1} title="Introdução" position={1} />)
    expect(screen.getByText('Introdução')).toBeInTheDocument()
  })

  it('deve ter link para a página do player', () => {
    render(<LessonItem courseId={1} lessonId={5} title="Aula" position={1} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/courses/1/lessons/5')
  })

  it('deve exibir número da posição quando pendente', () => {
    render(<LessonItem courseId={1} lessonId={1} title="Aula" position={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('deve exibir check quando concluída', () => {
    render(<LessonItem courseId={1} lessonId={1} title="Aula" position={1} isCompleted />)
    expect(screen.getByText('✓')).toBeInTheDocument()
    expect(screen.getByLabelText('Concluída')).toBeInTheDocument()
  })

  it('deve ter aria-label Pendente quando não concluída', () => {
    render(<LessonItem courseId={1} lessonId={1} title="Aula" position={1} />)
    expect(screen.getByLabelText('Pendente')).toBeInTheDocument()
  })

  it('deve aplicar estilo ativo quando isActive=true', () => {
    render(<LessonItem courseId={1} lessonId={1} title="Aula" position={1} isActive />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('bg-blue-50')
  })
})
