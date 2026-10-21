# Test Report

<!--
    Commit this file to the root of your application's GitHub repository, alongside its code.
    Every requirement listed in your README.md needs at least one test case below. Giving each
    requirement a short ID in the README (e.g. R1, R2) makes the "Requirement" column easy to fill
    in and to check.
-->

## Summary

The application was tested using both automated and manual tests. Automated tests were run using `npm test`, which uses Node.js's built-in runner. The test suite covers the form model, field editor, form preview, password service, validation service, and export service. JSDOM is used to simulate user interactions and verify form behaviour and validation messages.

The automated tests cover field management, field configuration, validation rules, matching fields, password strength evaluation, invalid configurations, and HTML export. The test suite reported 68 passing tests and no failures.

Four additional manual tests were performed to verify the exported form's offline operation, independent operation, validation consistency, and error feedback. All four manual tests passed.

One of the more challenging aspects was verifying the exported HTML, since its validation logic must work independently of the original application. Manual testing confirmed that the exported form works offline, can be operated independently of the builder application, and produces equivalent validation results for the tested inputs.

## Test Results

| Test case | Requirement | Input | Expected outcome | Actual outcome |
| --------- | ----------- | ----- | ---------------- | -------------- |
| Add and remove fields | FR-01 | Add a field and remove it. | The field is added to or removed from the form. | Passed |
| Handle unique field identifiers | FR-01 | Add fields and test operations involving duplicate or missing identifiers. | Field identifiers are handled consistently, and invalid operations are handled appropriately. | Passed |
| Configure field properties | FR-02 | Update a field's label, input type, and required status. | The field configuration is updated. | Passed |
| Configure validation rules | FR-02 | Add validation rules and select digits-only validation. | Rules are configured correctly, and incompatible rules are removed. | Passed |
| Validate field values | FR-03 | Test valid and invalid values, including email addresses and length constraints. | Valid values pass, while invalid values are rejected with appropriate validation results. | Passed |
| Handle required and optional fields | FR-03, QR-01 | Leave required and optional fields empty. | Empty required fields are rejected, while empty optional fields are accepted where applicable. | Passed |
| Evaluate password | FR-04 | Test weak, strong, and invalid password inputs. | Passwords are evaluated correctly, and feedback is provided for invalid passwords. | Passed |
| Validate matching fields | FR-03 | Enter matching and non-matching values in linked fields. | Matching values pass, while non-matching values are rejected. | Passed |
| Preview validation feedback | FR-05, QR-01 | Enter valid and invalid values in the form preview. | Validation results and error messages are displayed, and errors are cleared when appropriate. | Passed |
| Export configured form | FR-06 | Export a form containing fields and validation rules. | A complete HTML document is generated with field markup and client-side validation logic. | Passed |
| Verify exported validation logic | FR-06 | Test valid and invalid values using the exported HTML. | The exported form validates input independently of the builder application. | Passed |
| Handle invalid configurations | FR-03 | Provide invalid field configuration or function arguments. | Invalid inputs are handled according to the relevant service's behaviour. | Passed |
| Verify offline operation | FR-07, QR-04 | Disable the network connection and open the exported HTML file directly in the browser. | The exported form opens and its styling and client-side validation work without a network connection. | Passed |
| Verify validation consistency | QR-03 | Enter the same valid and invalid values in the builder preview and exported form. | Both versions produce equivalent validation results. | Passed |
| Verify independent operation | FR-06, FR-07, QR-04 | Copy the exported HTML file outside the project, stop the development server, and open the file independently. | The exported form works without the builder application, development server, or project files. | Passed |
| Verify error feedback and recovery | QR-01, QR-03 | Submit invalid values, correct them, and submit again. | Clear errors appear for invalid fields and are cleared or updated when the values become valid. | Passed |
| Verify modular structure | QR-05 | Review the application structure and module responsibilities. | Application logic is separated into modules with clear responsibilities. | Reviewed |
| Verify documentation | QR-06 | Review the README and supporting documentation. | Setup, usage, testing, limitations, and third-party licenses are documented. | Reviewed |

The test cases marked as **Passed** were verified through automated tests and/or tests described in the summary. The test marked as **Reviewed** were accessed through manual code or documentation review rather than automated execution.


## Known Issues in Third-Party Modules

No known issues affecting the application's tested functionality were identified during integration and testing. This does not constitute a comprehensive audit of the third-party module.
