describe("Asset Assignment Management", () => {
  it("UI-09 - administrator assigns an asset to an employee", () => {
    const timestamp = Date.now();
    const assetName = `Cypress UI-09 Test Laptop ${timestamp}`;
    const serialNumber = `CYPRESS-UI09-${timestamp}`;

    const employeeId = "4ed0dcb8-2406-4876-ba8b-c9eb2c73f87f";

    // Log in as an administrator.
    cy.visit("/login");

    cy.get("#email").type("admin@test.com");

    cy.env(["adminPassword"]).then(({ adminPassword }) => {
      cy.get("#password").type(adminPassword, { log: false });
    });

    cy.contains("button", "Sign In").click();

    cy.url().should("include", "/admin");

    // Create a new asset for the assignment test.
    cy.visit("/admin/assets/new");

    cy.contains("h1", "Create Asset").should("be.visible");

    cy.get("#assetName").type(assetName);
    cy.get("#assetType").select("Laptop");
    cy.get("#serialNumber").type(serialNumber);
    cy.get("#purchaseDate").type("20261024");

    cy.contains("button", "Create Asset").click();

    cy.url().should("match", /\/admin\/assets$/);

    // Open the newly created asset.
    cy.contains("tr", serialNumber)
      .should("be.visible")
      .within(() => {
        cy.contains("a", assetName).click();
      });

    // Verify the asset details page.
    cy.contains("h1", assetName).should("be.visible");

    cy.contains("dt", "Assignment Status")
      .next("dd")
      .should("contain", "Available");

    // Select the employee.
    cy.get("#employee").select(employeeId);

    // Assign the asset.
    cy.contains("button", "Assign Asset").click();

    // Verify successful assignment.
    cy.get('[role="status"]')
      .should("contain", "Asset assigned successfully.");

    cy.contains("dt", "Assignment Status")
      .next("dd")
      .should("contain", "Assigned");

    cy.contains("dt", "Assigned User")
      .next("dd")
      .should("not.contain", "Not assigned");

    cy.contains("button", "Unassign Asset").should("be.visible");
  });
  
  it("UI-10 - employee views their assigned assets", () => {
    const timestamp = Date.now();
    const assetName = `Cypress UI-10 Test Laptop ${timestamp}`;
    const serialNumber = `CYPRESS-UI10-${timestamp}`;

    const employeeId = "4ed0dcb8-2406-4876-ba8b-c9eb2c73f87f";

    // Log in as an administrator.
    cy.visit("/login");

    cy.get("#email").type("admin@test.com");

    cy.env(["adminPassword"]).then(({ adminPassword }) => {
      cy.get("#password").type(adminPassword, { log: false });
    });

    cy.contains("button", "Sign In").click();

    cy.url().should("include", "/admin");

    // Create a new asset for UI-10.
    cy.visit("/admin/assets/new");

    cy.contains("h1", "Create Asset").should("be.visible");

    cy.get("#assetName").type(assetName);
    cy.get("#assetType").select("Laptop");
    cy.get("#serialNumber").type(serialNumber);
    cy.get("#purchaseDate").type("20261024");

    cy.contains("button", "Create Asset").click();

    cy.url().should("match", /\/admin\/assets$/);

    // Open the newly created asset.
    cy.contains("tr", serialNumber)
      .should("be.visible")
      .within(() => {
        cy.contains("a", assetName).click();
      });

    cy.contains("h1", assetName).should("be.visible");

    // Assign the asset to the test employee.
    cy.get("#employee").select(employeeId);

    cy.contains("button", "Assign Asset").click();

    cy.get('[role="status"]')
      .should("contain", "Asset assigned successfully.");

    cy.contains("dt", "Assignment Status")
      .next("dd")
      .should("contain", "Assigned");

    // Log out of the administrator account.
    cy.visit("/login");

    cy.contains("button", "Log Out").click();

    cy.contains("Logout successful.").should("be.visible");

    // Log in as the employee.
    cy.get("#email").clear().type("employee@test.com");

    cy.env(["employeePassword"]).then(({ employeePassword }) => {
      cy.get("#password")
        .clear()
        .type(employeePassword, { log: false });
    });

    cy.contains("button", "Sign In").click();

    cy.url().should("include", "/dashboard");

    // Open the employee's assigned assets page.
    cy.visit("/my/assets");

    cy.contains("h1", "My Assigned Assets").should("be.visible");

    // Verify the assigned asset appears with correct information.
    cy.contains("tr", serialNumber)
      .should("be.visible")
      .within(() => {
        cy.contains(assetName).should("be.visible");
        cy.contains("Laptop").should("be.visible");
        cy.contains(serialNumber).should("be.visible");
        cy.contains("Assigned").should("be.visible");
        cy.contains(/^AST-\d+$/).should("be.visible");
      });
  });

});

