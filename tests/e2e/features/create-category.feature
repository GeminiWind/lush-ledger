Feature: Budget category creation from the atelier

  Scenario: Create a category from the atelier
    Given my viewport is set to 1440x1600
    And I am logged in
    And I am on the "/app/atelier" page
    Then the "Budget Allocation" heading should be visible
    When I create a category named "E2E Category" from the atelier
    Then the generated category heading should be visible
    And my category should be saved for later scenarios

  Scenario: Create category shows validation errors for invalid input
    Given my viewport is set to 1440x1600
    And I am logged in
    And I am on the "/app/atelier" page
    Then the "Budget Allocation" heading should be visible
    When I click "Add New Category"
    Then the "Create New Category" heading should be visible
    When I fill "name" with ""
    And I fill "monthlyLimit" with ""
    And I click "Add Category"
    Then I should see the text "Category name is required."
    And I should see the text "Monthly limit is required."
    And the "Create New Category" heading should be visible

  Scenario: Unauthorized user is redirected to login
    When I am on the "/app/atelier" page
    Then I should be redirected to "/login"
    And the "Welcome Back to the Atelier" heading should be visible
