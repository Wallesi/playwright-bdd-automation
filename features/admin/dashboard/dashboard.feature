Feature: Dashboard Navigation
  As a logged-in admin
  I want to navigate through the admin panel
  So that I can access all sections

  Background:
    Given I am on the login page
    And I log in with valid credentials

  @smoke
  Scenario: URL is correct after login
    Then the URL should contain "/admin/rooms"

  Scenario Outline: Navbar links navigate to the correct section
    When I click the "<section>" link in the navbar
    Then the URL should contain "<expectedPath>"

    Examples:
      | section  | expectedPath    |
      | Rooms    | /admin/rooms    |
      | Report   | /admin/report   |
      | Branding | /admin/branding |
      | Messages | /admin/message  |
