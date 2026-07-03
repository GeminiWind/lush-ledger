Feature: User login

  Scenario: Log in with valid stored credentials redirects to the app
    Given a registered user exists
    And I am on the "/login" page
    Then the "Welcome Back to the Atelier" heading should be visible
    When I wait for the page to finish loading
    And I fill "email" with the registered user's email
    And I fill "password" with the registered user's password
    And I check "Remember this session"
    Then the "email" field should have the registered user's email as its value
    And the "Remember this session" checkbox should be checked
    And the form should be ready
    When I click "Sign In"
    Then I should be redirected to "/app"
