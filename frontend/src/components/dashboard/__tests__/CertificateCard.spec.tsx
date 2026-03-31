import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CertificateCard } from '../CertificateCard'

describe('CertificateCard', () => {
  const defaultProps = {
    certificateCode: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    courseName: 'TypeScript Mastery',
    issuedAt: '2026-01-20T14:05:00.000Z',
  }

  it('deve renderizar nome do curso', () => {
    render(<CertificateCard {...defaultProps} />)
    expect(screen.getByText('TypeScript Mastery')).toBeInTheDocument()
  })

  it('deve renderizar código do certificado', () => {
    render(<CertificateCard {...defaultProps} />)
    expect(screen.getByText('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBeInTheDocument()
  })

  it('deve exibir data formatada', () => {
    render(<CertificateCard {...defaultProps} />)
    expect(screen.getByText(/20\/01\/2026/)).toBeInTheDocument()
  })

  it('deve exibir badge "Certificado"', () => {
    render(<CertificateCard {...defaultProps} />)
    expect(screen.getByText('Certificado')).toBeInTheDocument()
  })

  it('deve exibir label "Código"', () => {
    render(<CertificateCard {...defaultProps} />)
    expect(screen.getByText('Código')).toBeInTheDocument()
  })
})
