/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    setAuth(accessToken?: string, refreshToken?: string): Chainable<void>;
    clearAuth(): Chainable<void>;
  }
}

