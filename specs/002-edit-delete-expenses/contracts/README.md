# Contracts: Edit and Delete Expenses

This app does not expose a backend API. Its user-facing contracts remain browser-side interactions on the existing page.

## Storage Contract

- Storage key: `expenses`
- Stored value: a JSON array of expense objects
- Each expense object contains `id`, `date`, `description`, `category`, and `amount`
- The stored array is updated after each successful add, edit, or delete operation

## UI Contract

- Each expense in the recent expenses list has an Edit action and a Delete action.
- Clicking Edit pre-fills the form in the same single page and allows the user to save the updated values.
- Clicking Delete removes the expense, updates localStorage, and rerenders the report immediately.
- Validation errors block invalid edits and display clear feedback without changing saved data.
