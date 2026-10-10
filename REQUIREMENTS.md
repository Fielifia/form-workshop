# Form Workshop — MVP Requirements

## 1. Purpose

Form Workshop is a web application for creating, configuring, validating, previewing, and exporting custom HTML forms.

The MVO focuses on a complete workflow: a user creates a form, configures its fields and validations rules, tests the form, and exports a standalone HTML file that works independently of Form Workshop.

A registration form is the initial use case, but the application must be designed for other types of forms as well.

---

## 2. Scope

### In scope

- Create and configure a form
- Add an remove form fields.
- Configure fields, input types, and validation rules.
- Validate field values and display understandable error messages.
- Integrate the project's reusable validation module.
- Integrate the password validation module.
- Preview and test a form before exporting it.
- Export a standalone HTML file with CSS and client-side JavaScript validation.
- Verify the exported form independently of the builder application.

### Out of scope

- Use accounts and authentication
- Database or server-side storage.
- Saving and loading forms between sessions.
- Receiving or storing submitted form responses.
- Advanced drag-and-drop editing.
- A backend for processing form submission.

---

## 3. Functional requirements

| ID    | Requirement                | Acceptance criteria                                                                                                                            | Related issue |
| :---- | :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- | :------------ |
| FR-01 | Form field management      | The user can add and remove fields. Each field has a unique identifier.                                                                        | #4, #5        |
| FR-02 | Field configuration        | The user can configure a field's label, input type, and applicable validation rules.                                                           | #4, #5        |
| FR-03 | Reusable validation module | The application uses the existing form validation module to validate field values and report errors.                        | #6            |
| FR-04 | Password validation        | The application uses the password module to evaluate password requirements and communicate validation feedback.                                | #7            |
| FR-05 | Form preview and testing   | The user can preview the configured form, enter values, and see validation results before exporting.                                           | #8            |
| FR-06 | Standalone HTML export     | The user can export the configured form as an HTML file containing the required markup, styling, and client-side validation logic.             | #9, #11       |
| FR-07 | Independent exported form  | The exported file can be opened independently of the builder application and validates input without requiring a server of network connection. | #9, #11       |

---

## 4. Quality requirements

| ID    | Requirement | Acceptance criteria | Related issue |
| :---- |  :---- |  :---- |  :---- | 
| QR-01 | Understandable feedback | Invalid values produces clear, field-specific error messages. | #6, #8              |
| QR-02 | Automated testing | Automated tests cover the core form configuration, validation integration, and export behaviour. | #10, #11              |
| QR-03 | Consistent validation | The builder preview and exported form enforce equivalent configured validation rules. | #10, #11              |
| QR-04 | Independent operation | The exported form does not depend on Form Workshop being available or running. | #9, #11              |
| QR-05 | Maintainability. | Application logic is separated into manageable modules with clear responsibilities. | #3–#11              |
| QR-06 | Documentation | Setup, usage, testing, limitations, and relevant third-party licenses are documented. | #2, #12              |

---

## 5. Acceptance test: complete workflow

The MVP is accepted when the following workflow can be completed:

1. Open Form Workshop in a browser.
2. Create a form containing username, email, password and confirmation fields.
3. Configure appropriate input types and validation rules for the fields.
4. Configure password requirements using the password validation.
5. Preview the form and submit invalid values.
6. Verify that invalid values are rejected and understandable error messages are displayed.
7. Enter valid values and verify that validation succeeds.
8. Export the form as a standalone HTML file.
9. Open the exported file independently of Form Workshop.
10. Repeat the invalid and valid input tests in the exported form.
11. Verify that the exported form produces equivalent validation results to the builder preview.

The workflow must be repeatable, and its core behaviour must be covered by automated tests where practical.

---

## 6. Assumptions and limitations

- The first implementation targets common-based form fields and client-side validation.
- The exact supported input types and validation rules will be determined by the capabilities of the integrated modules and documented as implementation proceeds.
- The password module is used for password validation; password generation is optional and not required for the MVP acceptance.
- Exported forms validate data in the browser but do not submit data to a server or persist responses.
- Third-party code and license notices must be preserved according to their respective licenses.

---

## 7. Definition of Done

The MVP is considered complete when:

- All functional requirements marked as in scope are implemented.
- The complete acceptance workflow can be performed successfully.
- Relevant automated tests pass.
- The exported form works independently and provides validation equivalent to the builder preview.
- The README and supporting documentation describe how to install, run, test, and use the application.
- Known limitations and third-party licenses are documented.

Individual requirements may be marked complete as their implementation issues are closed. The MVP itself is not complete until the end-to-end acceptance workflow passes.
