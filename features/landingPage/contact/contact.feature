Feature: Contact Form
  As a visitor
  I want to submit the contact form
  So that I can get in touch with the property

  Background:
    Given I am on the landing page

  @smoke
  Scenario: Successfully submit the contact form with valid data
    When I fill in the contact form with valid data
    And I submit the contact form
    Then I should see the contact success message

  @regression
  Scenario Outline: Required fields show "may not be blank" error when form is submitted empty
    When I submit the contact form
    Then I should see the contact error "<error>"

    Examples:
      | error                    |
      | Name may not be blank    |
      | Email may not be blank   |
      | Phone may not be blank   |
      | Subject may not be blank |
      | Message may not be blank |

  @regression
  Scenario: Phone field requires a minimum of 11 characters
    When I fill in the "Phone" contact field with "12345"
    And I submit the contact form
    Then I should see the contact error "Phone must be between 11 and 21 characters."
