import type { Page, Locator } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly stats: Locator
  readonly inProgressSection: Locator
  readonly completedSection: Locator
  readonly certificatesSection: Locator

  constructor(page: Page) {
    this.page = page
    this.stats = page.getByTestId('dashboard-stats')
    this.inProgressSection = page.getByTestId('dashboard-in-progress')
    this.completedSection = page.getByTestId('dashboard-completed')
    this.certificatesSection = page.getByTestId('dashboard-certificates')
  }

  async goto() {
    await this.page.goto('/dashboard')
  }

  courseCard(courseId: number): Locator {
    return this.page.getByTestId(`dashboard-course-card-${courseId}`)
  }

  certificateCard(certificateCode: string): Locator {
    return this.page.getByTestId(`certificate-card-${certificateCode}`)
  }
}
