Feature: Dashboard
  As a visitor
  I want to view the landing page
  So that I can see a welcome message

  @smoke
  Scenario: Dashboard shows a welcome message
    Given I am on the home page
    Then I should see a welcome message
    And I should see a button Book Now
