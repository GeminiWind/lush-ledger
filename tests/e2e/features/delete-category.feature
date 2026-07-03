Feature: Delete a budget category

  Background:
    Given my viewport is set to 1440x1600
    And I am logged in

  Scenario: Delete success removes category from active atelier list
    When I create a category named "E2E Delete" in the atelier with retry
    And I click the delete button for the generated category
    Then the delete confirmation for the generated category should be visible
    When I confirm the deletion
    Then the delete confirmation for the generated category should be hidden
    And the generated category heading should be hidden

  Scenario: Delete cancel keeps category unchanged
    When I create a category named "E2E Keep" in the atelier with retry
    And I click the delete button for the generated category
    Then the delete confirmation for the generated category should be visible
    When I cancel the deletion
    Then the delete confirmation for the generated category should be hidden
    And the generated category heading should be visible

  Scenario: Delete in-use category preserves ledger entry via Uncategorized
    When I create a category named "E2E InUse" in the atelier with retry
    And I create a ledger transaction with a unique generated note for the generated category via the API
    And I am on the "/app/atelier" page
    And I click the delete button for the generated category
    And I confirm the deletion
    Then the first generated category heading should be hidden
    And the ledger entry should be recategorized to "Uncategorized"
