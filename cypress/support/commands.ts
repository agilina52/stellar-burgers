/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// Cypress.Commands.add('setAuth', () => {
//   window.localStorage.setItem(
//     'refreshToken',
//     JSON.stringify('test-refreshToken')
//   );
//   cy.setCookie('accessToken', 'test-accessToken');
// });

// Cypress.Commands.add('clearAuth', () => {
//   window.localStorage.removeItem('refreshToken');
//   cy.clearCookie('accessToken');
// });

describe('Создание заказа — прямой подход', () => {
  const ingredientsApi = '**/api/ingredients';
  const userApi = '**/api/auth/user';
  const ordersApi = '**/api/orders';

  beforeEach(() => {
    // Моковые данные
    cy.intercept('GET', ingredientsApi, { fixture: 'ingredients.json' }).as(
      'getIngredients'
    );
    cy.intercept('GET', userApi, { fixture: 'user.json' });
    cy.intercept('POST', ordersApi, { fixture: 'order.json' }).as('postOrder');

    // ПРЯМАЯ установка токенов (без кастомных команд)
    window.localStorage.setItem(
      'refreshToken',
      JSON.stringify('test-refreshToken')
    );
    cy.setCookie('accessToken', 'test-accessToken');
  });

  afterEach(() => {
    // ПРЯМАЯ очистка токенов (без кастомных команд)
    window.localStorage.removeItem('refreshToken');
    cy.clearCookie('accessToken');
  });

  it('Создание заказа', () => {
    cy.visit('/');
    cy.wait('@getIngredients');
  });
});
