Feature: Ledger date grouping

  Scenario: Today and Yesterday headers appear in the correct order for mixed-date transactions
    Given my viewport is set to 1440x1600
    And I am logged in
    And two ledger transactions exist dated today and yesterday
    And I am on the "/app/ledger" page
    Then the "The Ledger" heading should be visible
    And the "Today" date section should be visible
    And the "Yesterday" date section should be visible
    And the "Today" date section should appear before the "Yesterday" date section
