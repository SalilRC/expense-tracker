<!--
Sync Impact Report
Version change: 1.0.1 -> 1.0.2
Modified principles:
- V. Validation First, Working First -> V. Validation First, Working First
Added sections: none
Removed sections: none
Deferred items: none
-->

# Expense Tracker Constitution

## Core Principles

### I. Single-Page Vanilla Client
The application MUST be a single-page expense tracker built only with HTML, CSS, and vanilla JavaScript. It MUST NOT use frameworks, external libraries, npm dependencies, build tools, or a backend service. The UI and data flow MUST run entirely in the browser.

### II. Local Storage Persistence
Expense data MUST persist in browser localStorage, not in a backend database or remote service. The app MAY also keep data in memory for the active page session, but persisted state MUST be synchronized to localStorage.

### III. Simple, Readable Code
Code MUST stay simple and readable rather than clever. The project is a learning exercise, so implementation MUST favor clear structure, understandable naming, and maintainable code over terse or intricate solutions.

### IV. Small Single-Purpose Functions
Functions MUST be small and single-purpose. Each function MUST perform one clearly named job, and higher-level behavior MUST be composed from those simple building blocks.

### V. Validation First, Working First
Basic input validation MUST be enforced: no empty fields, no negative amounts, a selected category, and a valid date. Invalid input MUST be rejected before submission, and errors MUST be surfaced clearly to the user in the form. Working code that satisfies requirements MUST be prioritized over premature optimization.

## Additional Constraints
The application MUST support the fixed category list: Groceries, Fuel, Travel, Eating Out, Utilities, and Other.
Expense state MUST persist to browser localStorage; no backend storage is allowed.
The app MUST be runnable locally using a simple static server such as Live Server.
The app MUST provide immediate, user-facing feedback when validation fails, without requiring a backend or advanced UI framework.

## Development Workflow
Requirement compliance MUST be verified for every change. Each update MUST reference the documented requirements and explain how it preserves the core principles.
Changes to functionality, validation, or user experience MUST include corresponding updates to the requirements or design documentation in `docs/`.

## Governance
This constitution defines the governing principles for the Expense Tracker project. All development decisions MUST align with the core principles and the documented requirements.
Amendments require a documented change to this file, review by project maintainers, and a version bump following the versioning policy.
Versioning policy:
- MAJOR: backward-incompatible governance or principle changes.
- MINOR: new principle or section addition, or material expansion of guidance.
- PATCH: wording clarifications, typo fixes, and non-semantic refinements.
Compliance review expectation:
- Every change MUST cite the affected principle(s).
- Reviews MUST verify that updates preserve the single-page, client-side, and validation requirements.

**Version**: 1.0.2 | **Ratified**: 2026-08-07 | **Last Amended**: 2026-08-07
