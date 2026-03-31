import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LessonList } from '../LessonList'
import type { Lesson } from '@/services/types/course'

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

const mockLessons: Lesson[] = [
  { id: 1, title: 'Aula 1', description: 'Desc 1', youtubeUrl: 'https://youtube.com/watch?v=abc', position: 1 },
  { id: 2, title: 'Aula 2', description: 'Desc 2', youtubeUrl: 'https://youtube.com/watch?v=def', position: 2 },
  { id: 3, title: 'Aula 3', description: 'Desc 3', youtubeUrl: 'https://youtube.com/watch?v=ghi', position: 3 },
]

describe('LessonList', () => {
  it('deve renderizar todas as aulas', () => {
    render(<LessonList courseId={1} lessons={mockLessons} />)
    expect(screen.getByText('Aula 1')).toBeInTheDocument()
    expect(screen.getByText('Aula 2')).toBeInTheDocument()
    expect(screen.getByText('Aula 3')).toBeInTheDocument()
  })

  it('deve exibir mensagem quando sem aulas', () => {
    render(<LessonList courseId={1} lessons={[]} />)
    expect(screen.getByText('Este curso ainda não possui aulas.')).toBeInTheDocument()
  })

  it('deve marcar aulas concluídas', () => {
    render(<LessonList courseId={1} lessons={mockLessons} completedLessonIds={[1, 3]} />)
    const checks = screen.getAllByText('✓')
    expect(checks).toHaveLength(2)
  })

  it('deve destacar aula ativa', () => {
    render(<LessonList courseId={1} lessons={mockLessons} activeLessonId={2} />)
    const links = screen.getAllByRole('link')
    const activeLink = links.find((l) => l.className.includes('bg-blue-50'))
    expect(activeLink).toBeDefined()
  })

  it('deve ordenar por posição', () => {
    const unordered: Lesson[] = [
      { id: 3, title: 'Terceira', description: '', youtubeUrl: '', position: 3 },
      { id: 1, title: 'Primeira', description: '', youtubeUrl: '', position: 1 },
      { id: 2, title: 'Segunda', description: '', youtubeUrl: '', position: 2 },
    ]
    render(<LessonList courseId={1} lessons={unordered} />)
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveTextContent('Primeira')
    expect(links[1]).toHaveTextContent('Segunda')
    expect(links[2]).toHaveTextContent('Terceira')
  })
})
