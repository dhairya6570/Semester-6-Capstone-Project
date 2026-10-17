describe("Administrator Asset Management", () => {
  it("UI-08 - administrator creates an asset and sees it in the asset list", () => {
    const timestamp = Date.now();
    const assetName = `Cypress UI-08 Test Laptop ${timestamp}`;
    const serialNumber = `CYPRESS-UI08-${timestamp}`;

    // Log in as an administrator.
    cy.visit("/login");

    cy.get("#email").type("admin@test.com");

    cy.env(["adminPassword"]).then(({ adminPassword }) => {
      cy.get("#password").type(adminPassword, { log: false });
    });

    cy.contains("button", "Sign In").click();

    cy.url().should("include", "/admin");

    // Open the Create Asset page.
    cy.visit("/admin/assets/new");

    cy.contains("h1", "Create Asset").should("be.visible");

    // Enter the asset information.
    cy.get("#assetName").type(assetName);
    cy.get("#assetType").select("Laptop");
    cy.get("#serialNumber").type(serialNumber);

    // Verify automatic date formatting.
    cy.get("#purchaseDate").type("20261017");
    cy.get("#purchaseDate").should("have.value", "2026-10-17");

    // Submit the form.
    cy.contains("button", "Create Asset").click();

    // Verify successful creation redirects to the asset list.
    cy.url().should("match", /\/admin\/assets$/);

    cy.contains("h1", "Asset Management").should("be.visible");

    // Verify the new asset appears with the expected information.
    cy.contains("tr", serialNumber)
      .should("be.visible")
      .within(() => {
        cy.contains(assetName).should("be.visible");
        cy.contains("Laptop").should("be.visible");
        cy.contains(serialNumber).should("be.visible");
        cy.contains("Available").should("be.visible");
        cy.contains(/^AST-\d+$/).should("be.visible");
      });
  });
});