import type { Page, Locator } from '@playwright/test'

export class AdminLessonsPage {
  readonly page: Page
  readonly addLessonButton: Locator
  readonly lessonReorderList: Locator
  readonly lessonForm: Locator
  readonly lessonFormTitle: Locator
  readonly lessonFormYoutubeUrl: Locator
  readonly lessonFormPosition: Locator
  readonly lessonFormSubmit: Locator
  readonly lessonFormCancel: Locator

  constructor(page: Page) {
    this.page = page
    this.addLessonButton = page.getByTestId('admin-add-lesson-button')
    this.lessonReorderList = page.getByTestId('lesson-reorder-list')
    this.lessonForm = page.getByTestId('lesson-form')
    this.lessonFormTitle = page.getByTestId('lesson-form-title')
    this.lessonFormYoutubeUrl = page.getByTestId('lesson-form-youtube-url')
    this.lessonFormPosition = page.getByTestId('lesson-form-position')
    this.lessonFormSubmit = page.getByTestId('lesson-form-submit')
    this.lessonFormCancel = page.getByTestId('lesson-form-cancel')
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
