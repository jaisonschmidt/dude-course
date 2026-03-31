import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressBar } from '../ProgressBar'

describe('ProgressBar', () => {
  it('deve renderizar porcentagem correta', () => {
    render(<ProgressBar completed={5} total={10} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('deve exibir 0% quando total é 0', () => {
    render(<ProgressBar completed={0} total={0} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('deve exibir 100% quando tudo completado', () => {
    render(<ProgressBar completed={10} total={10} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('deve ter role=progressbar', () => {
    render(<ProgressBar completed={3} total={10} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('deve ter aria-valuenow correto', () => {
    render(<ProgressBar completed={7} total={10} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '70')
  })

  it('deve ter aria-label acessível', () => {
    render(<ProgressBar completed={3} total={10} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', '30% concluído')
  })

  it('deve arredondar porcentagem', () => {
    render(<ProgressBar completed={1} total={3} />)
    expect(screen.getByText('33%')).toBeInTheDocument()
  })
})
