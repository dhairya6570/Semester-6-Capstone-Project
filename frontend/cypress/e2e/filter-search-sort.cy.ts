
describe("Week 9 - Filtering, Search, and Sorting", () => {
  beforeEach(() => {
    // Log in as an administrator before each test.
    cy.visit("/login");

    cy.get("#email").type("admin@test.com");

    cy.env(["adminPassword"]).then(({ adminPassword }) => {
      cy.get("#password").type(adminPassword, { log: false });
    });

    cy.contains("button", "Sign In").click();

    cy.url().should("include", "/admin");
  });

  it("UI-11 - administrator filters tickets by multiple statuses", () => {
    cy.visit("/admin/tickets");

    cy.contains("h1", "Support Tickets").should("be.visible");
    cy.contains("h2", "All Support Tickets").should("be.visible");

    // Filter tickets to Open and In Progress.
    cy.contains("label", "Open")
      .find('input[type="checkbox"]')
      .check();

    cy.contains("label", "In Progress")
      .find('input[type="checkbox"]')
      .check();

    cy.get('input[type="checkbox"]:checked').should("have.length", 2);

    cy.contains("Loading support tickets...").should("not.exist");

    // Verify every displayed ticket has an allowed status.
    cy.get("tbody tr").should("have.length.greaterThan", 0);

    cy.get("tbody tr").each(($row) => {
      cy.wrap($row)
        .find("td")
        .eq(4)
        .invoke("text")
        .then((status) => {
          expect(["Open", "In Progress"]).to.include(status.trim());
        });
    });

    // Clear the filters and verify the checkboxes reset.
    cy.contains("button", "Clear Filters").click();

    cy.get('input[type="checkbox"]:checked').should("have.length", 0);
    cy.contains("Loading support tickets...").should("not.exist");
  });

  it("UI-12 - administrator searches tickets and sorts by creation date", () => {
    cy.visit("/admin/tickets");

    cy.contains("h1", "Support Tickets").should("be.visible");

    // Search using mixed-case text to test case-insensitive matching.
    cy.get("#ticket-search").type("cYpReSs");

    cy.contains("button", "Search").click();

    cy.contains("Loading support tickets...").should("not.exist");

    cy.get("tbody tr").should("have.length.greaterThan", 0);

    // Every displayed title should contain the search term.
    cy.get("tbody tr").each(($row) => {
      cy.wrap($row)
        .find("td")
        .eq(1)
        .invoke("text")
        .then((title) => {
          expect(title.toLowerCase()).to.include("cypress");
        });
    });

    // Sort by oldest creation date first.
    cy.get("#ticket-sort").select("asc");

    cy.get("#ticket-sort").should("have.value", "asc");

    cy.contains("Loading support tickets...").should("not.exist");

    // Verify sorting through the ticket IDs, which increase
    // as new tickets are created.
    cy.get("tbody tr").then(($rows) => {
      const ids = [...$rows].map((row) => {
        const idText = row.querySelector("td")?.textContent ?? "";
        return Number(idText.replace("#", "").trim());
      });

      const sortedIds = [...ids].sort((a, b) => a - b);

      expect(ids).to.deep.equal(sortedIds);
    });

    // Restore the default newest-first order.
    cy.get("#ticket-sort").select("desc");

    cy.get("#ticket-sort").should("have.value", "desc");

    cy.contains("Loading support tickets...").should("not.exist");

    cy.get("tbody tr").then(($rows) => {
      const ids = [...$rows].map((row) => {
        const idText = row.querySelector("td")?.textContent ?? "";
        return Number(idText.replace("#", "").trim());
      });

      const sortedIds = [...ids].sort((a, b) => b - a);

      expect(ids).to.deep.equal(sortedIds);
    });

    // Reset the search and sorting controls.
    cy.contains("button", "Clear Filters").click();

    cy.get("#ticket-search").should("have.value", "");
    cy.get("#ticket-sort").should("have.value", "desc");
  });

  it("UI-13 - administrator filters assets by assignment status", () => {
    cy.visit("/admin/assets");

    cy.contains("h1", "Asset Management").should("be.visible");
    cy.contains("h2", "Registered Assets").should("be.visible");

    // Show only assigned assets.
    cy.get("#asset-status-filter").select("Assigned");

    cy.get("#asset-status-filter").should("have.value", "Assigned");

    cy.contains("Loading assets...").should("not.exist");

    cy.get("tbody tr").should("have.length.greaterThan", 0);

    cy.get("tbody tr").each(($row) => {
      cy.wrap($row).find("td").eq(4).should("contain.text", "Assigned");
    });

    // Show only available assets.
    cy.get("#asset-status-filter").select("Available");

    cy.get("#asset-status-filter").should("have.value", "Available");

    cy.contains("Loading assets...").should("not.exist");

    cy.get("tbody tr").should("have.length.greaterThan", 0);

    cy.get("tbody tr").each(($row) => {
      cy.wrap($row).find("td").eq(4).should("contain.text", "Available");
    });

    // Clear the filter and restore all assets.
    cy.contains("button", "Clear Filter").click();

    cy.get("#asset-status-filter").should("have.value", "All");

    cy.contains("Loading assets...").should("not.exist");
  });
});
