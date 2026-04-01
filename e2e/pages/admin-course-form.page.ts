import type { Page, Locator } from '@playwright/test'

export class AdminCourseFormPage {
  readonly page: Page
  readonly form: Locator
  readonly titleInput: Locator
  readonly descriptionTextarea: Locator
  readonly thumbnailInput: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.form = page.getByTestId('course-form')
    this.titleInput = page.getByTestId('course-form-title')
    this.descriptionTextarea = page.getByTestId('course-form-description')
    this.thumbnailInput = page.getByTestId('course-form-thumbnail')
    this.submitButton = page.getByTestId('course-form-submit')
  }

  async fillCourseForm(data: {
    title: string
    description: string
    thumbnailUrl?: string
  }) {
    await this.titleInput.fill(data.title)
    await this.descriptionTextarea.fill(data.description)
    if (data.thumbnailUrl) {
      await this.thumbnailInput.fill(data.thumbnailUrl)
    }
    await this.submitButton.click()
  }

  async gotoNew() {
    await this.page.goto('/admin/courses/new')
  }

  async gotoEdit(courseId: number) {
    await this.page.goto(`/admin/courses/${courseId}/edit`)
  }
}
