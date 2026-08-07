# Data Model: Expense Tracker

## Entity: Expense

An expense is a single spending record entered by the user.

### Fields

- **date**: string
  - Represents the date the expense occurred.
  - Must be present and valid.
- **description**: string
  - Short explanation of the expense.
  - Must be non-empty.
- **category**: string
  - Must be one of the fixed categories.
- **amount**: number
  - Must be a positive number.

### Validation Rules

- A date is required.
- A description is required.
- Category must match one of the allowed values.
- Amount must be greater than zero.

## Entity: Expense Collection

The application stores an array of expenses in memory and persists the same array to localStorage.

## Entity: Report Summary

The report summary is derived from the expense collection and contains:

- **category totals**: total spend per category
- **grand total**: total spend across all expenses

The summary is recalculated immediately after each successful expense submission.
