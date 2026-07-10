Feature: Landing Page Sections
  As a visitor
  I want to navigate to the different sections via the navbar
  So that I can explore the page content

  Background:
    Given I am on the landing page

  @smoke
  Scenario Outline: Navbar links scroll to the correct section
    When I click the "<section>" section link in the navbar
    Then the URL should contain "<anchor>"
    And I should see a section heading "<heading>"

    Examples:
      | section  | anchor     | heading      |
      | Rooms    | /#rooms    | Our Rooms    |
      | Location | /#location | Our Location |
