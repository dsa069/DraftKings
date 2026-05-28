describe('Client Detail Navigation E2E', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8100/#/tabs/players');
  });

  it('should navigate to settings', () => {
    // Click on the settings button
    cy.get('ion-tab-button').eq(2).click();

    // Should navigate to settings
    cy.url().should('include', '/tabs/settings');
  });
});
