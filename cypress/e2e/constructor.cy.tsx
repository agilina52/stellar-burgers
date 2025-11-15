/// <reference types="cypress" />

describe('Создание заказа — с data-атрибутами', () => {
  const ingredientsApi = '**/api/ingredients';
  const userApi = '**/api/auth/user';
  const ordersApi = '**/api/orders';

  beforeEach(() => {
    // Моковые данные
    cy.intercept('GET', ingredientsApi, { fixture: 'ingredients.json' }).as(
      'getIngredients'
    );
    cy.intercept('GET', userApi, { fixture: 'user.json' }).as('getUser');
    cy.intercept('POST', ordersApi, { fixture: 'order.json' }).as('postOrder');

    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('refreshToken', 'test-refreshToken');
      }
    });
    cy.setCookie('accessToken', 'test-accessToken');
    cy.wait('@getIngredients');
  });

  afterEach(() => {
    cy.clearCookies();
    cy.window().then((win) => {
      win.localStorage.removeItem('refreshToken');
    });
  });

  it('Процесс создания заказа', () => {
    cy.wait('@getIngredients');

    // Добавление ингредиента из списка ингредиентов в конструктор
    cy.get('[data-testid=ingredient-bun-list]').within(() => {
      cy.get('[data-testid=ingredient-item]')
        .filter(':contains("Краторная булка N-200i")')
        .find('button')
        .click();
    });

    cy.get('[data-testid=ingredient-main-list]').within(() => {
      cy.get('[data-testid=ingredient-item]')
        .filter(':contains("Биокотлета из марсианской Магнолии")')
        .find('button')
        .click();
    });

    cy.get('[data-testid=ingredient-sauce-list]').within(() => {
      cy.get('[data-testid=ingredient-item]')
        .filter(':contains("Соус Spicy-X")')
        .find('button')
        .click();
    });

    // Проверка конструктора (burger-constructor)
    cy.get('[data-testid=burger-constructor]').should(
      'contain.text',
      'Краторная булка N-200i'
    );
    cy.get('[data-testid=burger-constructor]').should(
      'contain.text',
      'Биокотлета из марсианской Магнолии'
    );
    cy.get('[data-testid=burger-constructor]').should(
      'contain.text',
      'Соус Spicy-X'
    );

    // Проверка конкретных элементов конструктора (burger-constructor)
    cy.get('[data-testid=constructor-bun-top]').should('exist');
    cy.get('[data-testid=constructor-ingredient]').should('have.length', 2);
    cy.get('[data-testid=constructor-bun-bottom]').should('exist');

    // Оформление заказа (burger-constructor)
    cy.get('[data-testid=place-order-button]').click();
    cy.wait('@postOrder');

    // Проверка модального окна заказа (burger-constructor)
    cy.get('[data-testid=order-modal]').should('be.visible');

    // Проверка номера заказа (order-details)
    cy.fixture('order.json').then((order) => {
      const expectedOrderNumber = order.order.number;
      cy.get('[data-testid=order-number]')
        .contains(String(expectedOrderNumber))
        .should('exist');
    });

    // Закрытие модального окна
    cy.get('[data-testid=modal-close-button]').click();
    cy.get('[data-testid=order-modal]').should('not.exist');

    // Проверка очистки конструктора (burger-constructor)
    cy.get('[data-testid=constructor-bun-top]').should('not.exist');
    cy.get('[data-testid=constructor-ingredient]').should('have.length', 0);
    cy.get('[data-testid=constructor-bun-bottom]').should('not.exist');

    // Проверка плейсхолдеров после очистки
    cy.get('[data-testid=no-buns-top]').should('exist');
    cy.get('[data-testid=no-ingredients]').should('exist');
    cy.get('[data-testid=no-buns-bottom]').should('exist');
  });

  it('Открытие и закрытие модального окна ингредиента', () => {
    cy.wait('@getIngredients');

    // Открытие модального окна ингредиента
    cy.get('[data-testid=ingredient-bun-list]')
      .find('a')
      .filter(':contains("Краторная булка N-200i")')
      .click();
    cy.get('[data-testid=ingredient-modal]').should('be.visible');
    cy.get('[data-testid=ingredient-modal]').should(
      'contain.text',
      'Краторная булка N-200i'
    );

    // Закрытие через крестик
    cy.get('[data-testid=modal-close-button]').click();
    cy.get('[data-testid=ingredient-modal]').should('not.exist');

    // Открытие и закрытие через оверлей (modal и modal-overlay)
    cy.get('[data-testid=ingredient-bun-list]')
      .find('a')
      .filter(':contains("Краторная булка N-200i")')
      .click();
    cy.get('[data-testid=ingredient-modal]').should('be.visible');
    cy.get('[data-testid=modal-overlay]').click({ force: true });
    cy.get('[data-testid=ingredient-modal]').should('not.exist');
  });
});
