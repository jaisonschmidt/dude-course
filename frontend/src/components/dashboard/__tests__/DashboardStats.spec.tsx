import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DashboardStats } from '../DashboardStats'

describe('DashboardStats', () => {
  it('deve renderizar contadores', () => {
    render(
      <DashboardStats totalInProgress={5} totalCompleted={3} totalCertificates={2} />,
    )
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('deve renderizar labels', () => {
    render(
      <DashboardStats totalInProgress={0} totalCompleted={0} totalCertificates={0} />,
    )
    expect(screen.getByText('Em Progresso')).toBeInTheDocument()
    expect(screen.getByText('Concluídos')).toBeInTheDocument()
    expect(screen.getByText('Certificados')).toBeInTheDocument()
  })

  it('deve renderizar zeros corretamente', () => {
    render(
      <DashboardStats totalInProgress={0} totalCompleted={0} totalCertificates={0} />,
    )
    const zeros = screen.getAllByText('0')
    expect(zeros).toHaveLength(3)
  })
})
