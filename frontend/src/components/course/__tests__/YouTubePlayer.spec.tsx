import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { YouTubePlayer, extractVideoId } from '../YouTubePlayer'

describe('extractVideoId', () => {
  it('deve extrair ID de URL padrão', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=abc12345678')).toBe('abc12345678')
  })

  it('deve extrair ID de URL curta', () => {
    expect(extractVideoId('https://youtu.be/abc12345678')).toBe('abc12345678')
  })

  it('deve extrair ID de URL embed', () => {
    expect(extractVideoId('https://www.youtube.com/embed/abc12345678')).toBe('abc12345678')
  })

  it('deve retornar null para URL inválida', () => {
    expect(extractVideoId('https://example.com/video')).toBeNull()
  })
})

describe('YouTubePlayer', () => {
  it('deve renderizar iframe com URL válida', () => {
    render(<YouTubePlayer youtubeUrl="https://www.youtube.com/watch?v=abc12345678" />)
    const iframe = document.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe?.src).toContain('youtube.com/embed/abc12345678')
  })

  it('deve ter aspect ratio 16:9', () => {
    const { container } = render(
      <YouTubePlayer youtubeUrl="https://www.youtube.com/watch?v=abc12345678" />,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('aspect-video')
  })

  it('deve ter loading lazy', () => {
    render(<YouTubePlayer youtubeUrl="https://www.youtube.com/watch?v=abc12345678" />)
    const iframe = document.querySelector('iframe')
    expect(iframe?.getAttribute('loading')).toBe('lazy')
  })

  it('deve exibir mensagem para URL inválida', () => {
    render(<YouTubePlayer youtubeUrl="https://example.com/video" />)
    expect(screen.getByText('URL de vídeo inválida')).toBeInTheDocument()
  })

  it('deve ter allowFullScreen', () => {
    render(<YouTubePlayer youtubeUrl="https://www.youtube.com/watch?v=abc12345678" />)
    const iframe = document.querySelector('iframe')
    expect(iframe?.allowFullscreen).toBe(true)
  })
})
