import type { Page, Locator } from '@playwright/test'

export class RegisterPage {
  readonly page: Page
  readonly form: Locator
  readonly nameInput: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly confirmPasswordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator
  readonly loginLink: Locator

  constructor(page: Page) {
    this.page = page
    this.form = page.getByTestId('register-form')
    this.nameInput = page.getByTestId('register-name-input')
    this.emailInput = page.getByTestId('register-email-input')
    this.passwordInput = page.getByTestId('register-password-input')
    this.confirmPasswordInput = page.getByTestId('register-confirm-password-input')
    this.submitButton = page.getByTestId('register-submit-button')
    this.errorMessage = page.getByTestId('register-error-message')
    this.loginLink = page.getByTestId('register-login-link')
  }

  async goto() {
    await this.page.goto('/register')
  }

  async register(name: string, email: string, password: string) {
    await this.nameInput.fill(name)
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.confirmPasswordInput.fill(password)
    await this.submitButton.click()
  }
}
