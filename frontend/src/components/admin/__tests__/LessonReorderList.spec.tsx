import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LessonReorderList } from '../LessonReorderList'
import type { Lesson } from '@/services/types/course'

const mockLessons: Lesson[] = [
  { id: 1, title: 'Aula 1', description: 'Desc', youtubeUrl: 'https://youtube.com/watch?v=a', position: 1 },
  { id: 2, title: 'Aula 2', description: 'Desc', youtubeUrl: 'https://youtube.com/watch?v=b', position: 2 },
  { id: 3, title: 'Aula 3', description: 'Desc', youtubeUrl: 'https://youtube.com/watch?v=c', position: 3 },
]

describe('LessonReorderList', () => {
  const onReorder = vi.fn()
  const onEdit = vi.fn()
  const onDelete = vi.fn()

  it('deve renderizar todas as aulas', () => {
    render(
      <LessonReorderList
        lessons={mockLessons}
        onReorder={onReorder}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )
    expect(screen.getByText('Aula 1')).toBeInTheDocument()
    expect(screen.getByText('Aula 2')).toBeInTheDocument()
    expect(screen.getByText('Aula 3')).toBeInTheDocument()
  })

  it('deve exibir posições', () => {
    render(
      <LessonReorderList
        lessons={mockLessons}
        onReorder={onReorder}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('deve exibir mensagem quando sem aulas', () => {
    render(
      <LessonReorderList
        lessons={[]}
        onReorder={onReorder}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )
    expect(screen.getByText(/nenhuma aula cadastrada/i)).toBeInTheDocument()
  })

  it('deve ter botões de editar e deletar por aula', () => {
    render(
      <LessonReorderList
        lessons={mockLessons}
        onReorder={onReorder}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )
    const editButtons = screen.getAllByRole('button', { name: /editar/i })
    const deleteButtons = screen.getAllByRole('button', { name: /deletar/i })
    expect(editButtons).toHaveLength(3)
    expect(deleteButtons).toHaveLength(3)
  })

  it('deve ter drag handles com aria-label', () => {
    render(
      <LessonReorderList
        lessons={mockLessons}
        onReorder={onReorder}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )
    expect(screen.getByLabelText('Reordenar Aula 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Reordenar Aula 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Reordenar Aula 3')).toBeInTheDocument()
  })
})
