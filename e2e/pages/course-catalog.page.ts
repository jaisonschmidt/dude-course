import type { Page, Locator } from '@playwright/test'

export class CourseCatalogPage {
  readonly page: Page
  readonly courseList: Locator
  readonly paginationPrev: Locator
  readonly paginationNext: Locator
  readonly paginationInfo: Locator

  constructor(page: Page) {
    this.page = page
    this.courseList = page.getByTestId('course-list').first()
    this.paginationPrev = page.getByTestId('pagination-prev').first() // .first() is required because Next.js streaming SSR can duplicate this test id in strict mode
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
