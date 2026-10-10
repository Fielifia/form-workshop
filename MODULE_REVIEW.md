# Module Review

## 1. Form Validation Module

**Source:** Own `form-validation` module developed in Laboration 2
**Language:** JavaScript (ES modules)
**License:** ISC

### API

The module provides the following main classes:
- `Validation` — registers fields and validates input data.
- `Field` — represents a field and its validation rules.
- `Rule` — provides validation rules, including required values, email, length, numeric values, and matching fields.
- `Result` — represents the validation result.
- `ValidationError` — represents a validation error.

### Dependencies

The module uses its own classes and rules. No external production dependencies exist.

### Integration considerations

The module can be reused to validate configurable form fields. The application must translate validation results into understandable feedback in the user interface.

## 2. Password Module

**Source:** `password-module`
**Language:** JavaScript (ES modules)
**License:** MIT

### API

The module exports three main classes:

- `PasswordValidator` — checks password requirements, evaluates password strength, and provides suggestions.
- `ValidationResult` — represents password validation results.
- `PasswordGenerator` — generates passwords.

The password validator supports checks for minimum length, uppercase and lowercase letters, numbers, special characters, and spaces.

### Dependencies

The reviewed `package.json` lists ESLint-related dependencies. No external production dependencies are listed.

### Integration considerations

The `PasswordValidator` can be used to validate password fields and provide feedback. Password generation is optional and is not required for the MVP.


## 3. Compatibility and Integration Constraints

Both modules use JavaScript ES modules and can be imported into the Form Workshop application.

- The form validation module handles general field validation.
- The password module handles password-specific validation.
- The application must adapt the modules' validation results to the user interface.
- The exported form must not depend on modules or resources loaded from a remote server.
- The original module implementations and their license notices must be preserved as required by their respective licenses.

The modules have different responsibilities and should be used together rather than replacing one another.

## 4. Validation and Export Strategy

### Builder

The builder will use the form validation module for general field validation and the password module for password-specific checks. Validation results will be presented as field-specific feedback.

### Exported HTML

The exported HTML file must contain the markup, styling, and JavaScript required to validate the form independently.

The export implementation must include or embed the required validation logic rather than relying on the builder application or network-loaded dependencies. The exported form must enforce equivalent configured validation rules to the builder preview.

### Limitations

The exported form will perform client-side validation only. It will not submit data to a server or persist form responses.

The exact export implementation must be verified through testing to ensure that the exported file works without a network connection.

## 5. Summary

The form validation module handles general field validation, while the password module provides password-specific validation.

The planned integration keeps these responsibilities separate and adapts their results for the builder interface. The exported HTML must contain the resources and validation logic needed to operate independently.

The implementation must preserve applicable license notices and be tested to verify compatibility, standalone operation, and consistent validation behaviour.
