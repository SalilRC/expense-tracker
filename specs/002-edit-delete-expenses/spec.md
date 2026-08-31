# Feature Specification: Edit and Delete Expenses

**Feature Branch**: `002-edit-delete-expenses`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "Extend the existing single-page expense tracker so users can edit and delete expenses from the report list. Each expense must include controls to edit the record in the same form and to delete it using an explicit confirmation step. Editing must allow the date, description, category, or amount to be changed in-place, and the same validation rules used when adding an expense apply during editing. After a successful edit or delete, the report and totals update immediately and the updated data persists to localStorage. Deletion must be confirmed by the user before the expense is permanently removed. This remains a plain HTML/CSS/vanilla JavaScript app with no backend."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Delete an Expense (Priority: P1)

A user can remove an expense from the report list so the stored record and totals stay accurate.

**Why this priority**: Removing incorrect or outdated expense entries is essential to maintaining trustworthy spending records.

**Independent Test**: A user can click a delete action, confirm the deletion in the native browser confirmation dialog, and immediately see the expense disappear from the list while the category totals and grand total update.

**Acceptance Scenarios**:

1. **Given** an expense is shown in the report list, **When** a user clicks the delete control for that expense and then confirms the deletion in the native browser dialog, **Then** the expense is removed from the collection and localStorage is updated immediately.
2. **Given** a user clicks the delete control but does not confirm the action in the native browser dialog, **When** the confirmation step is presented, **Then** the expense remains in the list and the report is not changed.
3. **Given** a user deletes an expense, **When** the report re-renders, **Then** the affected category total and the grand total are recalculated from the remaining expenses.

---

### User Story 2 - Edit an Existing Expense (Priority: P1)

A user can correct any field on an existing expense without leaving the page.

**Why this priority**: Expense records are often entered with mistakes or changed later, and users need a simple way to fix them without losing data integrity.

**Independent Test**: A user can open an expense for editing in the existing form, change one or more fields, save the change, and confirm the updated values appear in the list and totals.

**Acceptance Scenarios**:

1. **Given** an expense exists in the report list, **When** a user chooses to edit it, **Then** the existing form is reused in edit mode, pre-filled with the current values, and includes Save Changes and Cancel actions so the user can change any allowed field.
2. **Given** the user updates an expense with valid values, **When** the form is submitted, **Then** the stored record is updated, localStorage is saved, and the report displays the new data immediately.
3. **Given** the user attempts to save an edited expense with invalid data, **When** the validation runs, **Then** the edit is blocked and a clear validation message explains what needs to be corrected.

---

### User Story 3 - Preserve the Existing Expense Tracker Experience (Priority: P2)

A user can continue using the tracker in the same single-page flow while maintaining a fixed category list and consistent validation behavior.

**Why this priority**: This feature extends the app without changing its core simplicity, browser-only architecture, or localStorage approach.

**Independent Test**: A user can add, review, edit, and delete expenses using the same single-page interface and receive consistent validation feedback.

**Acceptance Scenarios**:

1. **Given** the user is working in the tracker, **When** they edit or delete an expense, **Then** the page remains in a single-page workflow without reloading or a backend dependency.
2. **Given** a user changes an expense amount or category, **When** the report updates, **Then** the totals reflect the new values and the overall summary remains accurate.

---

### Edge Cases

- What happens when a user edits an expense to a blank description or invalid date?
- What happens when a user deletes the last remaining expense?
- How does the system behave if localStorage contains malformed or previously saved data during edit or delete actions?
- What happens when a user edits a category from one value to another and the totals must be recomputed instantly?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to add expenses as before and continue to view the current list and summary.
- **FR-002**: The system MUST provide both an edit control and an explicit delete control for each expense shown in the report list.
- **FR-003**: The system MUST require an explicit user confirmation step before a delete action permanently removes the selected expense from the in-memory collection and updates localStorage. The confirmation step MUST use the browser's native confirm dialog, and if the user does not confirm, the expense MUST remain unchanged and the report MUST remain unchanged.
- **FR-004**: The system MUST recalculate category totals and the grand total immediately after a successful delete action and re-render the report.
- **FR-005**: The system MUST allow users to edit an existing expense in place on the same form, updating any of the following fields: date, description, category, or amount.
- **FR-006**: The system MUST enforce the same validation rules for edited expenses as for newly added expenses: ISO date format, non-empty description, category from the fixed list, and positive amount with two decimal places.
- **FR-007**: The system MUST reject invalid edits and show clear feedback without saving partial or invalid changes.
- **FR-008**: The system MUST update the report immediately after a successful edit so the list and totals reflect the latest values.
- **FR-009**: The system MUST preserve the single-page, no-backend, browser-only architecture and continue using localStorage persistence.
- **FR-010**: The system MUST support the same fixed category list as the original expense tracker: Groceries, Fuel, Travel, Eating Out, Utilities, and Other.

### Key Entities *(include if feature involves data)*

- **Expense**: A single spending record containing an id, date, description, category, and amount.
- **Expense Collection**: The array of all saved expenses persisted in localStorage.
- **Spending Summary**: The derived totals by category and the overall grand total for the current collection.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can delete an expense only after explicitly confirming the delete action in the browser's native confirm dialog, and the expense is then removed from the list and summary totals; if they cancel the confirmation, no data is deleted and the totals remain unchanged.
- **SC-002**: Users can edit any valid expense field in the existing form and see the updated values reflected in the report without reloading the page.
- **SC-003**: Invalid edits are rejected with a clear message and the original saved values remain unchanged.
- **SC-004**: Category totals and the grand total stay synchronized with the saved localStorage data after each successful add, edit, or delete action.
- **SC-005**: The app remains a single-page vanilla JavaScript experience that persists data in browser localStorage with no backend dependency.

## Assumptions

- The app is intended for a single user working in a browser on a single device.
- The original expense tracker epic is complete, and this epic extends it with maintenance operations for existing expenses.
- Edit operations happen in place on the existing form, while delete operations use a dedicated confirmation action before removal.
- Expense data remains local to the browser and is not shared across devices.
- The fixed category list remains consistent with the original feature and does not need to be user-configurable in this version.
