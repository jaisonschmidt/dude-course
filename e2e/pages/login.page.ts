import type { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly form: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator
  readonly registerLink: Locator

  constructor(page: Page) {
    this.page = page
    this.form = page.getByTestId('login-form')
    this.emailInput = page.getByTestId('login-email-input')
    this.passwordInput = page.getByTestId('login-password-input')
    this.submitButton = page.getByTestId('login-submit-button')
    this.errorMessage = page.getByTestId('login-error-message')
    this.registerLink = page.getByTestId('login-register-link')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}
