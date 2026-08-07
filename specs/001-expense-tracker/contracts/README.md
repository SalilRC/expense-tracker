# Contracts: Expense Tracker

This app does not expose a backend API. Its user-facing contracts are limited to browser-side interactions:

## Storage Contract

- Storage key: `expenses`
- Stored value: a JSON array of expense objects
- Each expense object contains `date`, `description`, `category`, and `amount`

## UI Contract

- The page contains a form section and a report section.
- Submitting a valid form adds an expense, updates the report, and resets the form.
- Submitting an invalid form blocks the save and shows validation feedback.
