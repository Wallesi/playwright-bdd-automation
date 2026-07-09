Feature: Dashboard
  As a logged-in user
  I want to view my dashboard
  So that I can see a summary of my activity

  Background:
    Given I am on the login page
    And I log in with valid credentials

  @smoke
  Scenario: Dashboard shows a welcome message
    Then I should see a welcome message
