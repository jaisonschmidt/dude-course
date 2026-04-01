import type { Page, Locator } from '@playwright/test'

export class LessonPlayerPage {
  readonly page: Page
  readonly lessonList: Locator
  readonly progressBar: Locator
  readonly progressPercentage: Locator
  readonly markCompleteButton: Locator
  readonly completedBadge: Locator
  readonly nextLessonLink: Locator
  readonly prevLessonLink: Locator

  constructor(page: Page) {
    this.page = page
    this.lessonList = page.getByTestId('lesson-list')
    this.progressBar = page.getByTestId('progress-bar')
    this.progressPercentage = page.getByTestId('progress-bar-percentage')
    this.markCompleteButton = page.getByTestId('lesson-mark-complete-button')
    this.completedBadge = page.getByTestId('lesson-completed-badge')
    this.nextLessonLink = page.getByTestId('lesson-next-link')
    this.prevLessonLink = page.getByTestId('lesson-prev-link')
  }

  async goto(courseId: number, lessonId: number) {
    await this.page.goto(`/courses/${courseId}/lessons/${lessonId}`)
  }

  lessonItem(lessonId: number): Locator {
    return this.page.getByTestId(`lesson-item-${lessonId}`)
  }
}
