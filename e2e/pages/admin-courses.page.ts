import type { Page, Locator } from '@playwright/test'

export class AdminCoursesPage {
  readonly page: Page
  readonly createCourseButton: Locator

  constructor(page: Page) {
    this.page = page
    this.createCourseButton = page.getByTestId('admin-create-course-button')
  }

  async goto() {
    await this.page.goto('/admin/courses')
  }

  courseCard(courseId: number): Locator {
    return this.page.getByTestId(`admin-course-card-${courseId}`)
  }

  publishButton(courseId: number): Locator {
    return this.page.getByTestId(`admin-course-publish-${courseId}`)
  }

  unpublishButton(courseId: number): Locator {
    return this.page.getByTestId(`admin-course-unpublish-${courseId}`)
  }

  deleteButton(courseId: number): Locator {
    return this.page.getByTestId(`admin-course-delete-${courseId}`)
  }

  editLink(courseId: number): Locator {
    return this.page.getByTestId(`admin-course-edit-${courseId}`)
  }

  lessonsLink(courseId: number): Locator {
    return this.page.getByTestId(`admin-course-lessons-${courseId}`)
  }
}
