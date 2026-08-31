# Data Model: Expense Tracker

## Entity: Expense

An expense is a single spending record entered by the user.

### Fields

- **id**: string
  - A unique identifier generated when the expense is created.
  - A timestamp-based string is suitable for this version.
- **date**: string
  - Represents the date the expense occurred.
  - Must be present and stored in ISO format (`YYYY-MM-DD`) to match an HTML date input value.
- **description**: string
  - Short explanation of the expense.
  - Must be non-empty.
- **category**: string
  - Must be one of the fixed categories.
- **amount**: number
  - Must be a positive number.
  - User input may be entered as a whole number or one-decimal value, and it is automatically normalized to two decimal places for storage and display (for example, `26` becomes `26.00`, and `25.1` becomes `25.10`).

### Validation Rules

- An id is generated automatically when the expense is created.
- A date is required and must use ISO format (`YYYY-MM-DD`).
- A description is required.
- Category must match one of the allowed values.
- Amount must be greater than zero and normalized to two decimal places before it is saved.

## Entity: Expense Collection

The application stores an array of expenses in memory and persists the same array to localStorage.

## Entity: Report Summary

The report summary is derived from the expense collection and contains:

- **category totals**: total spend per category
- **grand total**: total spend across all expenses

The summary is recalculated immediately after each successful expense submission.
