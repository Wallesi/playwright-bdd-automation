Feature: Login
  As a registered user
  I want to log into the application
  So that I can access my dashboard

  Background:
    Given I am on the login page

  @smoke
  Scenario: Successful login with valid credentials
    When I log in with valid credentials
    Then I should be redirected to the dashboard

  Scenario: Failed login with invalid credentials
    When I log in with invalid credentials
    Then I should see an error message "Invalid credentials"
