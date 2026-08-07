# Tasks: Expense Tracker

**Input**: Design documents from /specs/001-expense-tracker/

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the static app structure and wire the main HTML/CSS/JS files.

- [x] T001 Create the main app structure in index.html with a form section and a report section
- [x] T002 Create the base styling in style.css for layout, form controls, validation feedback, and report presentation
- [x] T003 [P] Create the app shell in app.js with empty state management and DOM element references

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the shared storage and state logic required by all user stories.

- [x] T004 Implement localStorage persistence helpers in app.js for loading and saving expenses as a JSON array
- [x] T005 Implement expense validation logic in app.js for date, description, category, and amount, enforcing that amount is a positive number with exactly two decimal places and that date follows ISO format (YYYY-MM-DD) matching an HTML date input
- [x] T006 Implement report calculation logic in app.js to aggregate totals by category and compute the grand total
- [x] T007 Implement app initialization in app.js to load existing expenses, render the report, and bind form submission logic

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Add a New Expense (Priority: P1) 🎯 MVP

**Goal**: Allow a user to add an expense from the form and immediately see the updated report.

**Independent Test**: A user can submit a valid expense and verify that it appears in the summary without leaving the page.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Add form submission handling in app.js to create an expense object with id, date, description, category, and amount
- [ ] T009 [US1] Add success handling in app.js to reset the form, save the updated expenses, and re-render the report
- [ ] T010 [US1] Add user-facing validation feedback in app.js and index.html for invalid submissions

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Review Spending by Category (Priority: P1)

**Goal**: Show clear totals per category and a grand total for all expenses.

**Independent Test**: A user can add multiple expenses in different categories and verify that each category total and the grand total are correct.

### Implementation for User Story 2

- [ ] T011 [P] [US2] Render the report section in index.html with category totals and a grand total summary
- [ ] T012 [US2] Render the current expense list in the report area with formatted date, description, category, and amount
- [ ] T013 [US2] Ensure totals are recalculated and displayed immediately after each successful submission

**Checkpoint**: At this point, User Stories 1 and 2 should both work independently.

---

## Phase 5: User Story 3 - Use a Simple, Guided Experience (Priority: P2)

**Goal**: Make the app easy to understand and use with a fixed category list and clear feedback.

**Independent Test**: A user can choose from the fixed categories and recover from validation errors without confusion.

### Implementation for User Story 3

- [ ] T014 [P] [US3] Populate the category select in index.html with the fixed categories Groceries, Fuel, Travel, Eating Out, Utilities, and Other
- [ ] T015 [US3] Add accessible labels and clear form messaging in index.html and style.css for validation and empty states
- [ ] T016 [US3] Preserve saved expenses after a page refresh by relying on the localStorage-backed initialization flow

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation of the complete experience.

- [ ] T017 [P] Refine the UI copy, spacing, and form layout in index.html and style.css
- [ ] T018 Verify the app behavior against the quickstart scenarios in specs/001-expense-tracker/quickstart.md
- [ ] T019 Review the implementation for readability and conformance with the constitution’s small-function guidance
