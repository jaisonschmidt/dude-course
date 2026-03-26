import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import HomePage from '../page'

describe('HomePage', () => {
  it('deve renderizar sem crash', () => {
    render(<HomePage />)
  })

  it('deve exibir o título "Dude Course"', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { name: /dude course/i })).toBeInTheDocument()
  })

  it('deve exibir link para /login', () => {
    render(<HomePage />)
    expect(screen.getByRole('link', { name: /entrar/i })).toHaveAttribute('href', '/login')
  })

  it('deve exibir link para /register', () => {
    render(<HomePage />)
    expect(screen.getByRole('link', { name: /criar conta/i })).toHaveAttribute('href', '/register')
  })
})
