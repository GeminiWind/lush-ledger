Feature: Update an existing budget category

  Scenario: Update an existing category's name and monthly limit
    Given a category exists from a previous scenario
    And my viewport is set to 1440x1600
    And I am logged in
    And I am on the "/app/atelier" page
    Then the "Budget Allocation" heading should be visible
    When I click "Edit total monthly cap"
    And I fill the total monthly cap with "1"
    And I click "Save"
    And I click the edit button for the previously created category
    Then the "Update Category" heading should be visible
    When I fill "name" with the updated category name
    And I fill "monthlyLimit" with "1"
    And I click "Update Category"
    Then the "Update Category" heading should be hidden
    And the updated category heading should be visible
    And the edit button for the updated category should be visible
