# Expense Tracker Requirements

## 1. Overview

This project is a simple single-page expense tracker built with HTML, CSS, and vanilla JavaScript. It allows a user to record personal expenses, view them in a list, and generate a summary report showing spending by category and the overall total.

The app is intended to be lightweight, easy to run locally, and suitable for a no-backend, no-build-tools setup.

## 2. User Stories

- As a user, I want to add a new expense so that I can track my spending.
- As a user, I want to view a summary report so that I can understand how much I have spent by category and in total.

## 3. Data Model

Each expense entry should contain the following fields:

- Date: the date the expense was incurred
- Description: a short explanation of the expense
- Category: one of the predefined categories
- Amount: the cost of the expense

### Suggested Expense Structure

```json
{
  "date": "2026-08-06",
  "description": "Groceries for the week",
  "category": "Groceries",
  "amount": 42.50
}
```

## 4. Fixed Category List

The application must support the following fixed categories:

- Groceries
- Fuel
- Travel
- Eating Out
- Utilities
- Other

## 5. Functional Requirements

### Expense Input Form

The app must provide an input form on the same page as the report output.

The form must collect:

- Date
- Description
- Category
- Amount

### Validation Rules

The following validation rules must apply:

- Date is required.
- Description is required and should not be empty.
- Category must be selected from the fixed list.
- Amount is required and must be a positive number.
- The app should accept common shorthand values such as `26` or `25.1` and automatically normalize them to two decimal places for storage and display (for example, `26.00` and `25.10`).
- The form should prevent submission if validation fails.
- Invalid fields should be clearly indicated to the user.

### Behavior

- When the form is submitted with valid data, the new expense should be added to the in-memory collection or persisted to local storage.
- After adding an expense, the form should reset for the next entry.
- The report should update immediately after a successful submission.

## 6. Report Requirement

The app must provide a report that aggregates expenses by category and displays a grand total.

### Report Output

The report should show:

- Total spend per category
- Grand total across all categories

### Example Report Behavior

- Groceries: $120.00
- Fuel: $45.50
- Total: $165.50

## 7. Non-Functional Notes

- The app should run locally using a simple static server such as Live Server.
- No backend or database is required.
- Expense data may be stored in memory for the current session or persisted in localStorage for repeat visits.
- The implementation should remain simple and easy to understand for a beginner-friendly demo.

## 8. Page Layout Requirement

The input form and the report output must both be displayed on the same HTML page for the current version of the application.

