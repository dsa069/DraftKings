describe('Client Detail Navigation E2E', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8100/#/tabs/tab1');
  });

  it('should navigate to tab2', () => {
    // Click on the tab2 button
    cy.get('ion-tab-button').eq(1).click();

    // Should navigate to tab2
    cy.url().should('include', '/tabs/tab2');
  });
});
