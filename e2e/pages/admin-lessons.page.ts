import type { Page, Locator } from '@playwright/test'

export class AdminLessonsPage {
  readonly page: Page
  readonly addLessonButton: Locator
  readonly lessonReorderList: Locator
  readonly lessonForm: Locator

  constructor(page: Page) {
    this.page = page
    this.addLessonButton = page.getByTestId('admin-add-lesson-button')
    this.lessonReorderList = page.getByTestId('lesson-reorder-list')
    this.lessonForm = page.getByTestId('lesson-form')
  }

  async goto(courseId: number) {
    await this.page.goto(`/admin/courses/${courseId}/lessons`)
  }

  lessonItem(lessonId: number): Locator {
    return this.page.getByTestId(`lesson-reorder-item-${lessonId}`)
  }

  editButton(lessonId: number): Locator {
    return this.page.getByTestId(`lesson-reorder-edit-${lessonId}`)
  }

  deleteButton(lessonId: number): Locator {
    return this.page.getByTestId(`lesson-reorder-delete-${lessonId}`)
  }
}
