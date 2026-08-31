# Quickstart: Edit and Delete Expenses

## Prerequisites

- A modern web browser
- Optional: a simple static server such as Live Server, Python http.server, or VS Code Live Server

## Run the App

1. Open the repository root in a browser.
2. Load the app by opening [index.html](../../index.html) directly or by serving the folder with a static server.
3. Add or load one or more expenses in the tracker.
4. Click Edit on an entry to change a field, then save it and verify the list and totals update immediately.
5. Click Delete on an entry and verify that it disappears from the list while the totals recalculate.
6. Refresh the page and confirm the updated records are still present in localStorage.

## Validation Scenarios

- Edit a valid expense and verify that the report updates without reloading the page.
- Try to save an edited expense with an invalid date, blank description, invalid category, or non-positive amount and confirm the validation message appears.
- Delete the final remaining expense and confirm the app shows the empty state.
- Refresh the page after an edit or delete and verify that the persisted data matches the current list and totals.
