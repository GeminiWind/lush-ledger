Feature: Account registration

  Scenario: Register with valid details redirects to the app and stores credentials
    Given I am on the "/register" page
    Then the "Create Your Atelier Account" heading should be visible
    When I wait for the page to finish loading
    And I fill "fullName" with "E2E Register User"
    And I fill "email" with a unique generated email
    And I fill "password" with "Aa!12345"
    And I fill "confirmPassword" with "Aa!12345"
    And I check "Accept terms"
    Then the "email" field should have the generated email as its value
    And the "Accept terms" checkbox should be checked
    And the form should be ready
    When I click "Join the Atelier"
    Then I should be redirected to "/app"
    And my credentials should be saved for later scenarios
