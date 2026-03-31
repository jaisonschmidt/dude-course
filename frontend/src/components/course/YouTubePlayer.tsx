interface YouTubePlayerProps {
  youtubeUrl: string
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function YouTubePlayer({ youtubeUrl }: YouTubePlayerProps) {
  const videoId = extractVideoId(youtubeUrl)

  if (!videoId) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        URL de vídeo inválida
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  )
}

export { extractVideoId }
