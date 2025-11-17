/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = Element> {
    setAuth(accessToken?: string, refreshToken?: string): Chainable<AUTWindow>;
    clearAuth(): Chainable<AUTWindow>;
  }
}
