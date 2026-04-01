'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Lesson } from '@/services/types/course'

interface SortableItemProps {
  lesson: Lesson
  onEdit: (lesson: Lesson) => void
  onDelete: (lessonId: number) => void
}

function SortableItem({ lesson, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
      data-testid={`lesson-reorder-item-${lesson.id}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label={`Reordenar ${lesson.title}`}
        data-testid={`lesson-reorder-drag-${lesson.id}`}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500">
        {lesson.position}
      </span>
      <span className="flex-1 truncate text-sm font-medium text-gray-900">
        {lesson.title}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(lesson)}
          className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
          data-testid={`lesson-reorder-edit-${lesson.id}`}
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(lesson.id)}
          className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
          data-testid={`lesson-reorder-delete-${lesson.id}`}
        >
          Deletar
        </button>
      </div>
    </div>
  )
}

interface LessonReorderListProps {
  lessons: Lesson[]
  onReorder: (reordered: Lesson[]) => void
  onEdit: (lesson: Lesson) => void
  onDelete: (lessonId: number) => void
}

export function LessonReorderList({
  lessons,
  onReorder,
  onEdit,
  onDelete,
}: LessonReorderListProps) {
  const [items, setItems] = useState(lessons)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Sync with parent when lessons prop changes
  if (lessons !== items && JSON.stringify(lessons.map((l) => l.id)) !== JSON.stringify(items.map((l) => l.id))) {
    setItems(lessons)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex).map(
      (item, index) => ({ ...item, position: index + 1 }),
    )
    setItems(reordered)
    onReorder(reordered)
  }

  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-500">
        Nenhuma aula cadastrada. Adicione a primeira aula.
      </p>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2" data-testid="lesson-reorder-list">
          {items.map((lesson) => (
            <SortableItem
              key={lesson.id}
              lesson={lesson}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
