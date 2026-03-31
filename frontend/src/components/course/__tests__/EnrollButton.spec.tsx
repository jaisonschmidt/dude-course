import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EnrollButton } from '../EnrollButton'

describe('EnrollButton', () => {
  const onEnroll = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve exibir "Iniciar Curso" quando não matriculado', () => {
    render(<EnrollButton isEnrolled={false} onEnroll={onEnroll} />)
    expect(screen.getByRole('button', { name: /iniciar curso/i })).toBeInTheDocument()
  })

  it('deve exibir "Matriculado" quando matriculado', () => {
    render(<EnrollButton isEnrolled={true} onEnroll={onEnroll} />)
    expect(screen.getByRole('button', { name: /matriculado/i })).toBeDisabled()
  })

  it('deve chamar onEnroll ao clicar', async () => {
    onEnroll.mockResolvedValueOnce(undefined)
    render(<EnrollButton isEnrolled={false} onEnroll={onEnroll} />)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /iniciar curso/i }))

    expect(onEnroll).toHaveBeenCalledTimes(1)
  })

  it('deve exibir loading durante enrollment', async () => {
    let resolveEnroll: () => void
    onEnroll.mockReturnValueOnce(new Promise<void>((resolve) => { resolveEnroll = resolve }))
    render(<EnrollButton isEnrolled={false} onEnroll={onEnroll} />)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /iniciar curso/i }))

    expect(screen.getByRole('button')).toHaveTextContent('Carregando...')

    resolveEnroll!()
  })
})
