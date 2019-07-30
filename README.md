# Step definition generator

Automatically generate your step definitions from feature files for [cypress-cucumber-preprocessor](https://github.com/TheBrainFamily/cypress-cucumber-preprocessor).

## Getting started
Install `step-definition-generator` from "Install" in Atom's settings or run:
`$ apm install step-definition-generator`

## How to use

* Select a `.feature` file
* Run the command `Step Definition Generator: generate`
  * ctrl + shift + h

This will create corresponding step definitions for this feature file in a relative path ./{FileName}/{FileName.js}, containing all the definitions for the steps of this feature.

When the file already exists you'll be prompted to overwrite the current file.

## Settings
There are several settings you can change, go to `preferences->packages->step-definition-generator` to change them.
#### Pending Method

You can control which method will be generated for each step automatically. `cy.pending()` by default.

##### Use Single Quotes In Features

When using variables in your feature files, they will be added to the step definitions. By default `""` are used to recognise variables, when setting this setting to true it will use `''` instead.

## Examples

`Login.feature`
```
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
```

Generated: `Login/Login.js`
```
import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';

Given('I am on the {a} page', (a) => {
  cy.pending();
});

When('I enter wrong credentials', () => {
  cy.pending();
});

When('I enter correct credentials', () => {
  cy.pending();
});

Then('I should see a notification saying wrong credentials', () => {
  cy.pending();
});

Then('The password field should be cleared', () => {
  cy.pending();
});

Then('I should be on the login page', () => {
  cy.pending();
});

Then('I should see a notification saying welcome', () => {
  cy.pending();
});

Then('I should be on the success page', () => {
  cy.pending();
});
```
