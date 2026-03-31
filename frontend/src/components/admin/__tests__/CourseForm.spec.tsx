import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CourseForm } from '../CourseForm'

describe('CourseForm', () => {
  const onSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    onSubmit.mockResolvedValue(undefined)
  })

  it('deve renderizar campos do formulário', () => {
    render(<CourseForm onSubmit={onSubmit} />)
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/thumbnail/i)).toBeInTheDocument()
  })

  it('deve exibir botão "Criar Curso" sem initialData', () => {
    render(<CourseForm onSubmit={onSubmit} />)
    expect(screen.getByRole('button', { name: /criar curso/i })).toBeInTheDocument()
  })

  it('deve exibir botão "Salvar" com initialData', () => {
    render(
      <CourseForm
        initialData={{ title: 'Teste', description: 'Desc longa suficiente' }}
        onSubmit={onSubmit}
      />,
    )
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
  })

  it('deve exibir erro para título curto', async () => {
    render(<CourseForm onSubmit={onSubmit} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/título/i), 'AB')
    await user.type(screen.getByLabelText(/descrição/i), 'Descrição com pelo menos 10 chars')
    await user.click(screen.getByRole('button', { name: /criar curso/i }))

    await waitFor(() => {
      expect(screen.getByText(/ao menos 3 caracteres/i)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('deve exibir erro para descrição curta', async () => {
    render(<CourseForm onSubmit={onSubmit} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/título/i), 'Curso')
    await user.type(screen.getByLabelText(/descrição/i), 'Curta')
    await user.click(screen.getByRole('button', { name: /criar curso/i }))

    await waitFor(() => {
      expect(screen.getByText(/ao menos 10 caracteres/i)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('deve submeter com dados válidos', async () => {
    render(<CourseForm onSubmit={onSubmit} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/título/i), 'Meu Curso')
    await user.type(screen.getByLabelText(/descrição/i), 'Uma descrição longa o suficiente')
    await user.click(screen.getByRole('button', { name: /criar curso/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Meu Curso',
          description: 'Uma descrição longa o suficiente',
        }),
      )
    })
  })
})
