import type { Page, Locator } from '@playwright/test'

export class CourseCatalogPage {
  readonly page: Page
  readonly courseList: Locator
  readonly paginationPrev: Locator
  readonly paginationNext: Locator
  readonly paginationInfo: Locator

  constructor(page: Page) {
    this.page = page
    this.courseList = page.getByTestId('course-list')
    this.paginationPrev = page.getByTestId('pagination-prev')
    this.paginationNext = page.getByTestId('pagination-next')
    this.paginationInfo = page.getByTestId('pagination-info')
  }

  async goto() {
    await this.page.goto('/courses')
  }

  courseCard(courseId: number): Locator {
    return this.page.getByTestId(`course-card-${courseId}`)
  }
}
