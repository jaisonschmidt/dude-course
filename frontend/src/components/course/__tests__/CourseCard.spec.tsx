/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CourseCard } from '../CourseCard'
import type { Course } from '@/services/types/course'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, ...rest } = props
    return <img {...rest} data-fill={fill ? 'true' : undefined} />
  },
}))

const mockCourse: Course = {
  id: 1,
  title: 'Node.js Fundamentals',
  description: 'Learn Node.js from scratch with hands-on projects',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  status: 'published',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('CourseCard', () => {
  it('deve renderizar título do curso', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText('Node.js Fundamentals')).toBeInTheDocument()
  })

  it('deve renderizar descrição do curso', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText(/Learn Node.js from scratch/)).toBeInTheDocument()
  })

  it('deve ter link para /courses/:id', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/courses/1')
  })

  it('deve renderizar imagem com alt correto', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByAltText('Thumbnail de Node.js Fundamentals')).toBeInTheDocument()
  })

  it('deve usar thumbnail fornecida', () => {
    render(<CourseCard course={mockCourse} />)
    const img = screen.getByAltText('Thumbnail de Node.js Fundamentals')
    expect(img).toHaveAttribute('src', 'https://example.com/thumb.jpg')
  })

  it('deve usar fallback quando thumbnailUrl é null', () => {
    const courseNoThumb = { ...mockCourse, thumbnailUrl: null }
    render(<CourseCard course={courseNoThumb} />)
    const img = screen.getByAltText('Thumbnail de Node.js Fundamentals')
    expect(img).toHaveAttribute('src', '/images/course-placeholder.svg')
  })
})
