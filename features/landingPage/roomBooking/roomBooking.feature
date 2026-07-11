Feature: Room Booking Navigation
  As a visitor
  I want to click the "Book Now" button for a room
  So that I am taken to that room's details page with all its information

  Background:
    Given I am on the landing page

  @smoke
  Scenario Outline: Clicking Book Now redirects to the correct room details page
    When I click the "<room>" "Book Now" button
    Then I should be redirected to the "<room>" room page
    And I should see the "Room Description" section
    And I should see the "Room Features" section
    And I should see the "Room Policies" section
    And I should see the room price
    And I should see the "Price Summary" section

    Examples:
      | room   |
      | Single |
      | Double |
      | Suite  |
