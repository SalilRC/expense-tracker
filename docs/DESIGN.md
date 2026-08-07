# Technical Design Outline

## 1. Expense Object Structure

A single expense can be represented as a plain JavaScript object:

- date: string
- description: string
- category: string
- amount: number

## 2. Storage Approach

Expenses should be stored in a simple in-memory array initially, with optional persistence to localStorage. In-memory storage keeps the app simple for a first version, while localStorage allows data to survive refreshes without adding backend complexity.

## 3. Main Functions in app.js

- initApp(): set up event listeners and initialize the app state
- loadExpenses(): load saved expenses from storage or start with an empty array
- addExpense(expense): add a new expense to the collection
- validateExpense(expense): check required fields and valid values
- calculateReport(expenses): compute totals per category and grand total
- renderForm(): display the form UI state if needed
- renderReport(expenses): update the report view on the page
- saveExpenses(): persist expenses to localStorage

## 4. Suggested HTML Structure

The page should be organized into two main sections:

- A form section for entering a new expense with fields for date, description, category, and amount
- A report section that displays category totals and the grand total, along with the current expense list if desired
