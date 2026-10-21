# Form Workshop

Form Workshop is a web application for creating, configuring, validating, previewing, and exporting custom HTML forms. It helps users build forms without having to write the HTML and validation logic themselves.

## Vision

Make it easy for users to create and test custom HTML forms and export them as standalone files that work independently of the application.

## Requirements

### Functional Requirements

- **FR-01 – Field management:** The application shall allow users to add and remove form fields. Field identifiers shall be unique.
- **FR-02 – Field configuration:** The application shall allow users to configure field labels, input types, and validation rules.
- **FR-03 – Field validation:** The application shall validate field values using the configured rules and distinguish between valid and invalid input.
- **FR-04 – Password validation:** The application shall evaluate passwords using the password validation module and provide relevant feedback.
- **FR-05 – Form preview:** The application shall provide a preview where users can test the form and view validation results.
- **FR-06 – HTML export:** The application shall export a standalone HTML document containing the form markup, styling, and client-side validation.
- **FR-07 – Independent operation:** The exported form shall work in a browser without requiring the original application, a server, or a network connection.

### Quality Requirements

- **QR-01 – Clear feedback:** Validation errors shall be clear and associated with the relevant fields.
- **QR-02 – Automated testing:** Automated tests shall cover the application's configuration, validation, and export functionality.
- **QR-03 – Validation consistency:** The preview and exported form shall produce equivalent validation results for equivalent inputs.
- **QR-04 – Offline operation:** The exported form shall work independently and offline.
- **QR-05 – Maintainability:** The application shall use a modular structure with clear responsibilities.
- **QR-06 – Documentation:** The project documentation shall describe setup, usage, testing, limitations, and third-party licenses.

## Features

- Create and remove form fields.
- Configure field labels, input types, and validation rules.
- Validate form values and display field-specific feedback.
- Preview and test forms before exporting them.
- Export forms as standalone HTML files with styling and client-side validation.
- Use exported forms without requiring a server or an internet connection.

## Requirements

- Node.js
- npm

## Getting started

### 1. Clone the repositories:

Create a directory for the application and its modules:
   ```bash
   mkdir <folder-name>
   cd <folder-name>
   ```

Clone the Form Workshop:
   ```bash
   git clone https://github.com/Fielifia/form-workshop.git
   ```
Clone the validation modules alongside the application:
   ```bash
   git clone https://github.com/Fielifia/form-validation.git
   git clone https://github.com/hanmar31/password-module.git
   ```

The three repositories should be located in the same parent directory.

### 2. Install the dependencies

Navigate to Form Workshop:
   ```bash
   cd form-workshop
   ```

Install the application dependencies:
   ```bash
   npm install
   ```

If the modules have their own dependencies, follow the instructions in their respective README files.

### 3. Start the application

Start the development server:
   ```bash
   npm run dev
   ```

Open the local URL displayed in the terminal.

## Available scripts

| Command           | Description                            |
| :---------------- | :------------------------------------- |
| `npm run dev`     | Starts the development server.         |
| `npm run build`   | Builds the application for production. |
| `npm run preview` | Previews the production build locally. |
| `npm test`        | Runs the automated tests.              |

## Validation modules

Form Workshop integrates two reusable modules developed as separate projects for 1DV610 Laboration 2.

### Form Validation Module

**Repository**: [Fielifia/form-validation](https://github.com/Fielifia/form-validation)

This module provides the core form validation functionality.

It allows the application to:

- Create and configure fields with unique identifiers.
- Add one or more validation rules to each field.
- Validate field values against configured rules.
- Collect validation errors and provide error messages.
- Check requirements such as required fields, email format, length, value ranges, and matching fields.

The module is responsible for field configuration and validation logic. Form Workshop is responsible for user interface and presenting validation feedback.

### Password module

**Repository**: [hanmar31/password-module](https://github.com/hanmar31/password-module)

This module provides password validation functionality through its `PasswordValidator` class.

Form Workshop uses the module to:

- Validate passwords against the module's password requirements.
- Evaluate password strength.
- Provide suggestions for improving passwords.

The module also supports password generation, but this functionality is not used by Form Workshop.

The module does not store or encrypt passwords, handle authentication, or connect to external services.

## Testing

Run the automated tests from the Form Workshop directory:

```bash
npm test
```

The automated tests cover core application functionality, including form configuration, validation, password functionality, preview, and export.

Manual test cases, expected outcomes, actual results, and requirement mappings are documented in [`TEST_REPORT.md`](./TEST_REPORT.md)

The test report also explains how the tests were performed so that others can reproduce them.

## Project structure

- `src/app.js` — application entry point.
- `src/state/` — form configuration and state management.
- `src/ui/` — user interface components.
- `src/services/` — validation and export logic.
- `src/styles/` — application styles.
- `test/` — automated tests.
- `REQUIREMENTS.md` — functional and quality requirements.
- `MODULE_REVIEW.md` — review of the integrated validation modules.
- `TEST_REPORT.md` — test cases and test results.

## Requirements and documentation

- `REQUIREMENTS.md` describes the functional requirements, quality requirements, and acceptance criteria.
- `MODULE_REVIEW.md` reviews the integrated validation modules.
- `TEST_REPORT.md` documents the test procedures and results.

## Limitations

Exported forms perform client-side validation in the browser. Exporting a form does not by itself provide server-side validation, data storage, authentication, or backend form submission.

Password validation are provided by the integrated password module. The application relies on that module for password-related validation.

## Course context

Form Workshop is developed as a part of the 1DV610 course. The project demonstrates how reusable modules can be integrated into an application while keeping the application and modules as separate projects.

## License

- **Form Workshop**: MIT — see [`package.json`](./package.json).
- **Form Validation Module**: ISC — see the [form-validation repository](https://github.com/Fielifia/form-validation).
- **Password Module**: MIT — see the [password-module repository](https://github.com/hanmar31/password-module).
