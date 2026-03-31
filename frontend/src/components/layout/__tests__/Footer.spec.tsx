import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from '../Footer'

describe('Footer', () => {
  it('deve renderizar copyright com ano atual', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(String(currentYear)))).toBeInTheDocument()
  })

  it('deve renderizar "Dude Course"', () => {
    render(<Footer />)
    expect(screen.getByText(/Dude Course/)).toBeInTheDocument()
  })

  it('deve renderizar links de Catálogo e Sobre', () => {
    render(<Footer />)
    expect(screen.getByText('Catálogo')).toBeInTheDocument()
    expect(screen.getByText('Sobre')).toBeInTheDocument()
  })

  it('deve ter aria-label no nav', () => {
    render(<Footer />)
    expect(screen.getByLabelText('Links do rodapé')).toBeInTheDocument()
  })
})
