'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const courseSchema = z.object({
  title: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter ao menos 10 caracteres'),
  thumbnailUrl: z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),
})

export type CourseFormData = z.infer<typeof courseSchema>

interface CourseFormProps {
  initialData?: { title: string; description: string; thumbnailUrl?: string | null }
  onSubmit: (data: CourseFormData) => Promise<void>
  isLoading?: boolean
}

export function CourseForm({ initialData, onSubmit, isLoading = false }: CourseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      thumbnailUrl: initialData?.thumbnailUrl ?? '',
    },
  })

  const handleFormSubmit = async (data: CourseFormData) => {
    const cleaned = {
      ...data,
      thumbnailUrl: data.thumbnailUrl || undefined,
    }
    await onSubmit(cleaned)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Título"
        {...register('title')}
        error={errors.title?.message}
        disabled={isLoading}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          id="description"
          rows={4}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          disabled={isLoading}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-red-600" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>
      <Input
        label="URL da Thumbnail (opcional)"
        {...register('thumbnailUrl')}
        error={errors.thumbnailUrl?.message}
        disabled={isLoading}
        placeholder="https://example.com/image.jpg"
      />
      <div className="flex justify-end">
        <Button type="submit" loading={isLoading}>
          {initialData ? 'Salvar' : 'Criar Curso'}
        </Button>
      </div>
    </form>
  )
}
