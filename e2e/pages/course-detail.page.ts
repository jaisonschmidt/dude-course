import type { Page, Locator } from '@playwright/test'

export class CourseDetailPage {
  readonly page: Page
  readonly enrollButton: Locator
  readonly enrolledBadge: Locator
  readonly lessonList: Locator

  constructor(page: Page) {
    this.page = page
    this.enrollButton = page.getByTestId('enroll-button')
    this.enrolledBadge = page.getByTestId('enroll-button-enrolled')
    this.lessonList = page.getByTestId('lesson-list')
  }

  async goto(courseId: number) {
    await this.page.goto(`/courses/${courseId}`)
  }

  lessonItem(lessonId: number): Locator {
    return this.page.getByTestId(`lesson-item-${lessonId}`)
  }
}
