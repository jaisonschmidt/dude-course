'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const youtubeUrlRegex =
  /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/

const lessonSchema = z.object({
  title: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  description: z.string().optional().or(z.literal('')),
  youtubeUrl: z
    .string()
    .min(1, 'URL do YouTube é obrigatória')
    .regex(youtubeUrlRegex, 'URL inválida. Use uma URL do YouTube'),
  position: z.number().int().min(1, 'Posição deve ser ≥ 1'),
})

export type LessonFormData = z.infer<typeof lessonSchema>

interface LessonFormProps {
  initialData?: {
    title: string
    description?: string
    youtubeUrl: string
    position: number
  }
  onSubmit: (data: LessonFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function LessonForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: LessonFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      youtubeUrl: initialData?.youtubeUrl ?? '',
      position: initialData?.position ?? 1,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="lesson-form">
      <Input
        label="Título"
        {...register('title')}
        error={errors.title?.message}
        disabled={isLoading}
        data-testid="lesson-form-title"
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="lesson-description" className="text-sm font-medium text-gray-700">
          Descrição (opcional)
        </label>
        <textarea
          id="lesson-description"
          rows={3}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          disabled={isLoading}
          data-testid="lesson-form-description"
          {...register('description')}
        />
      </div>
      <Input
        label="URL do YouTube"
        {...register('youtubeUrl')}
        error={errors.youtubeUrl?.message}
        disabled={isLoading}
        placeholder="https://www.youtube.com/watch?v=..."
        data-testid="lesson-form-youtube-url"
      />
      <Input
        label="Posição"
        type="number"
        {...register('position', { valueAsNumber: true })}
        error={errors.position?.message}
        disabled={isLoading}
        data-testid="lesson-form-position"
      />
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={isLoading} data-testid="lesson-form-cancel">
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={isLoading} data-testid="lesson-form-submit">
          {initialData ? 'Salvar' : 'Adicionar Aula'}
        </Button>
      </div>
    </form>
  )
}
