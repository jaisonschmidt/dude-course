/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CourseList } from '../CourseList'
import type { Course } from '@/services/types/course'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, ...rest } = props
    return <img {...rest} data-fill={fill ? 'true' : undefined} />
  },
}))

const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Course A',
    description: 'Description A',
    thumbnailUrl: null,
    status: 'published',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Course B',
    description: 'Description B',
    thumbnailUrl: null,
    status: 'published',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    title: 'Course C',
    description: 'Description C',
    thumbnailUrl: null,
    status: 'published',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

describe('CourseList', () => {
  it('deve renderizar N cards de curso', () => {
    render(<CourseList courses={mockCourses} />)
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })

  it('deve renderizar os títulos dos cursos', () => {
    render(<CourseList courses={mockCourses} />)
    expect(screen.getByText('Course A')).toBeInTheDocument()
    expect(screen.getByText('Course B')).toBeInTheDocument()
    expect(screen.getByText('Course C')).toBeInTheDocument()
  })

  it('deve exibir empty state quando array vazio', () => {
    render(<CourseList courses={[]} />)
    expect(screen.getByText('Nenhum curso disponível no momento.')).toBeInTheDocument()
  })

  it('deve aceitar mensagem de empty state customizada', () => {
    render(<CourseList courses={[]} emptyMessage="Nada aqui" />)
    expect(screen.getByText('Nada aqui')).toBeInTheDocument()
  })

  it('deve ter grid layout', () => {
    const { container } = render(<CourseList courses={mockCourses} />)
    const grid = container.firstChild as HTMLElement
    expect(grid.className).toContain('grid')
    expect(grid.className).toContain('grid-cols-1')
    expect(grid.className).toContain('sm:grid-cols-2')
    expect(grid.className).toContain('lg:grid-cols-3')
  })
})
