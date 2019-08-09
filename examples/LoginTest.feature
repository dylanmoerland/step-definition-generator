Feature: Login user
  As a visitor I want to sign in, so I can access the rest of the platform

  Scenario: Unsuccessful login attempt
    Given I am on the "login" page
    When I enter wrong credentials
    Then I should see a notification saying wrong credentials
    And The password field should be cleared
    And I should be on the login page

  Scenario: Successful login attempt
    Given I am on the "login" page
    When I enter correct credentials
    Then I should see a notification saying welcome
    And I should be on the success page
