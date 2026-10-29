# Quickstart: CSV Expense Import and Export

## Prerequisites

- A current desktop browser with JavaScript enabled.
- Node.js available for the automated regression suite.
- The repository opened from its root directory.

## Automated Validation

Run the existing dependency-free test suite:

```powershell
node tests/app.test.js
```

Expected result: the suite exits successfully and reports that the regression tests passed. It covers CSV parsing/serialization, valid and invalid imports, persistence and totals, export contents, and earlier add/edit/delete behavior.

## Manual Browser Scenarios

1. Start the app with a local static server (for example, VS Code Live Server) and add expenses in more than one category.
2. Export expenses and verify the downloaded `expenses.csv` contains the four columns in the documented order, two-decimal amount values, and correctly preserved quoted text.
3. Download the `CSV Import Template`, add a row using a supported category and valid date/amount, then import the completed CSV.
4. Import a CSV with reordered required headers, one valid row, and one row with an invalid category. Confirm the valid row is appended and the skipped row is identified with its record number and correction reason.
5. Reload the page and confirm imported records and category/grand totals persist.
6. Import a file with malformed quoting or missing required headers. Confirm a clear file error appears and existing expenses remain unchanged.
7. Cancel the file picker and confirm the expense collection is unchanged.

See [the data model](data-model.md) and [CSV contract](contracts/csv-format.md) for the accepted fields and file-level behavior.