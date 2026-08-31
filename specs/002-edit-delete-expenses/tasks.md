# Tasks: Edit and Delete Expenses

**Input**: Design documents from /specs/002-edit-delete-expenses/

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend the existing static app with form-based edit mode and explicit delete actions.

- [X] T001 Create the edit and delete row actions in the recent-expenses list and ensure each row keeps readable access to its associated expense id
- [X] T002 Add support in the form UI for edit mode, including Save Changes and Cancel actions while preserving the existing add-expense form
- [X] T003 Extend the DOM wiring so the form and report can switch between add and edit states without reloading the page

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the shared delete-confirmation and in-place edit logic required by all user stories.

- [X] T004 Add delete-confirmation handling in app.js so a delete action is confirmed through the browser's native confirm dialog before removing the expense from state and updating localStorage
- [X] T005 Add edit-mode state tracking in app.js to remember the currently edited expense id and prefill the form with its values
- [X] T006 Reuse the existing validation and normalization flow during edit saves so edited values must pass the same rules as new expenses
- [X] T007 Recalculate category totals and the grand total from the current expense array after every successful edit or delete and re-render the report

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Delete an Expense (Priority: P1) 🎯 MVP

**Goal**: Allow a user to delete an expense only after explicit confirmation and immediately see the corrected totals.

**Independent Test**: A user can click Delete, confirm the removal, and verify the expense disappears from the list while totals update.

### Implementation for User Story 1

- [X] T008 [P] [US1] Add a Delete button to each rendered expense entry and bind it to the matching expense id
- [X] T009 [US1] Remove the selected expense from state only after the native confirm dialog is accepted, persist the updated collection to localStorage, and re-render the report immediately
- [X] T010 [US1] Handle the empty-state case when the final expense is deleted and ensure category totals and the grand total display correctly at zero

**Checkpoint**: At this point, deleting an expense should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Edit an Existing Expense (Priority: P1)

**Goal**: Allow a user to correct expense data in the same page while preserving the current validation contract.

**Independent Test**: A user can open an expense for editing, change one or more fields, save the change, and verify the updated values appear in the report and totals without reloading the page.

### Implementation for User Story 2

- [X] T011 [P] [US2] Add an Edit button for each list item and switch the existing form into edit mode with the selected record prefilled
- [X] T012 [US2] Save the updated expense and persist the new values to localStorage using the same validation and normalization flow as new expenses
- [X] T013 [US2] Re-render the report immediately after a successful edit and reset the form to add mode after save or cancel
- [X] T014 [US2] Add cancel behavior so users can leave edit mode without saving changes and return to adding a new expense

**Checkpoint**: At this point, editing an expense should be fully functional and testable independently.

---

## Phase 5: User Story 3 - Preserve the Existing Experience (Priority: P2)

**Goal**: Maintain the single-page, browser-only, localStorage architecture while enhancing the tracker with edit and delete support.

**Independent Test**: A user can continue adding, editing, and deleting expenses without any page reload or backend dependency.

### Implementation for User Story 3

- [X] T015 [P] [US3] Preserve the fixed category list and validation messaging during both add mode and edit mode
- [X] T016 [US3] Ensure totals remain synchronized after each add, edit, and delete operation so the report and summary are always accurate
- [X] T017 [US3] Verify saved data remains correct after a refresh and that invalid edits do not overwrite valid stored records

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation of the full experience.

- [X] T018 [P] Refine the report-row actions, button styling, and spacing in index.html and style.css for clarity and usability
- [X] T019 Verify the app behavior against the quickstart scenarios in specs/002-edit-delete-expenses/quickstart.md
- [X] T020 Review the implementation for readability and conformance with the constitution’s small-function guidance
