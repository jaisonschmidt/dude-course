import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LessonForm } from '../LessonForm'

describe('LessonForm', () => {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    onSubmit.mockResolvedValue(undefined)
  })

  it('deve renderizar campos do formulário', () => {
    render(<LessonForm onSubmit={onSubmit} />)
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/youtube/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/posição/i)).toBeInTheDocument()
  })

  it('deve exibir botão "Adicionar Aula" sem initialData', () => {
    render(<LessonForm onSubmit={onSubmit} />)
    expect(screen.getByRole('button', { name: /adicionar aula/i })).toBeInTheDocument()
  })

  it('deve exibir botão "Salvar" com initialData', () => {
    render(
      <LessonForm
        initialData={{ title: 'Aula 1', youtubeUrl: 'https://www.youtube.com/watch?v=abc', position: 1 }}
        onSubmit={onSubmit}
      />,
    )
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
  })

  it('deve exibir erro para URL inválida', async () => {
    render(<LessonForm onSubmit={onSubmit} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/título/i), 'Aula 1')
    await user.type(screen.getByLabelText(/youtube/i), 'https://example.com/video')
    await user.click(screen.getByRole('button', { name: /adicionar aula/i }))

    await waitFor(() => {
      expect(screen.getByText(/url inválida/i)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('deve chamar onCancel ao clicar Cancelar', async () => {
    render(<LessonForm onSubmit={onSubmit} onCancel={onCancel} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('deve submeter com dados válidos', async () => {
    render(<LessonForm onSubmit={onSubmit} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/título/i), 'Introdução')
    await user.type(
      screen.getByLabelText(/youtube/i),
      'https://www.youtube.com/watch?v=abc12345678',
    )
    await user.click(screen.getByRole('button', { name: /adicionar aula/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })
})
