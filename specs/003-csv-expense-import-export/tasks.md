# Tasks: CSV Expense Import and Export

**Input**: Design documents from `specs/003-csv-expense-import-export/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/csv-format.md`, `quickstart.md`

**Tests**: Required by the specification. Extend the existing dependency-free Node VM suite in `tests/app.test.js`; no new test framework or package is needed.

**Organization**: Tasks are grouped by the three user stories in `spec.md`, in priority order.

## Phase 1: Setup

**Purpose**: The static app and existing Node test suite are already initialized; no project scaffolding or dependency installation is needed.

## Phase 2: Foundational

**Purpose**: Extend the shared browser test harness so story-specific tests can exercise file selection, CSV downloads, and storage without adding dependencies.

- [x] T001 Extend the DOM and browser API mocks in `tests/app.test.js` for import/export controls, selected-file reads, Blob/object-URL downloads, anchor clicks, localStorage resets, and deterministic unique expense IDs.

---

## Phase 3: User Story 1 - Export Expenses (Priority: P1)

**Goal**: Download the current expense collection as an escaped CSV with the required header and two-decimal plain amount values.

**Independent Test**: Run export-focused cases in `tests/app.test.js`; verify a header-only empty export, one row per current expense, correct escaping and amount formatting, a browser download, and no collection mutation.

### Tests for User Story 1

- [x] T002 [US1] Add export contract tests in `tests/app.test.js` for exact header order, one row per expense, empty collection, comma/quote/newline escaping, two-decimal amounts, download filename, and unchanged collection.

### Implementation for User Story 1

- [x] T003 [US1] Implement CSV field escaping, expense serialization, a client-side Blob download, and the export-control click handler in `app.js` using the documented `expenses.csv` format.
- [x] T004 [P] [US1] Add an accessible Export CSV control with the stable ID `export-csv` in `index.html` for the `app.js` handler to target.

**Checkpoint**: `node tests/app.test.js` passes the export cases, and exporting does not alter persisted expenses.

---

## Phase 4: User Story 2 - Import Expenses (Priority: P1)

**Goal**: Append valid CSV records to the existing collection, skip invalid rows with counts, and preserve all existing data on file-level errors or cancellation.

**Independent Test**: Run import-focused cases in `tests/app.test.js` for reordered/additional headers, valid and invalid rows, numeric normalization, CSV escaping, malformed files, cancellation, IDs, counts, persistence, and report totals.

### Tests for User Story 2

- [x] T005 [US2] Add import contract tests in `tests/app.test.js` for wrong-width rows skipped beside valid siblings with exact reasons, UTF-8/BOM and CRLF/LF handling, exact untrimmed headers, quoted fields, blank/header-only/zero-byte files, malformed CSV and duplicate headers, category case/whitespace, decimal grammar and reasons, the inclusive `100000` maximum, over-limit rejection before rounding, half-up rounding boundaries, storage failure rollback, accessible accepted/skipped feedback, template link/file, cancellation, persistence, and totals.

### Implementation for User Story 2

- [x] T006 [US2] Implement CSV parsing and file-input handling in `app.js`; classify parseable wrong-width records as skipped rows while continuing to stage valid siblings, and reserve atomic no-mutation failures for malformed CSV, invalid headers, or localStorage write failures. Include UTF-8/header handling, row validation, specific record-numbered reason reporting, decimal-only amount normalization with the inclusive `100000` raw-value maximum and half-up rounding, unique IDs, staged persistence before in-memory commit, rendering, and accepted/skipped or error feedback.
- [x] T007 [P] [US2] Add a keyboard-operable CSV file input, Import CSV control, adjacent live import-result/error message, and “CSV Import Template” download link with stable IDs in `index.html`; provide the header-only `expense-import-template.csv` file.

**Checkpoint**: `node tests/app.test.js` passes import cases; mixed files append only valid rows, while malformed files and canceled selection leave the collection unchanged.

---

## Phase 5: User Story 3 - Preserve Confidence in Existing Features (Priority: P2)

**Goal**: Keep earlier add, report, persistence, edit, and delete behavior covered by the same automated suite alongside the CSV cases.

**Independent Test**: Run `node tests/app.test.js` and confirm it covers prior expense creation and validation, category/grand totals, reload persistence, edit validation and updates, and confirmed/canceled deletion.

### Tests for User Story 3

- [x] T008 [US3] Extend regression coverage in `tests/app.test.js` for valid and invalid adds, category/grand totals, persistence after reload, valid and invalid edits, confirmed deletion, and canceled deletion without data changes, tracing coverage to the earlier feature acceptance criteria.

**Checkpoint**: The full suite exercises every CSV acceptance scenario and the earlier feature behaviors named in `spec.md`.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Keep the new controls usable, update governing requirements documentation, and validate the full workflow.

- [x] T009 [P] Style the import/export controls and live feedback consistently with the existing single-page layout in `style.css`.
- [x] T010 [P] Update `docs/REQUIREMENTS.md` with CSV export, append-only import, validation, skipped-row feedback, and automated regression-test requirements.
- [x] T011 Run `node tests/app.test.js` and complete the manual scenarios in `specs/003-csv-expense-import-export/quickstart.md`; resolve any failures in `app.js`, `index.html`, `style.css`, or `tests/app.test.js`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No work is needed; the app and test suite already exist.
- **Foundational (Phase 2)**: T001 enables browser API-level tests and blocks story test work.
- **User Stories (Phases 3-5)**: Stories follow priority order. US1 and US2 are independently valuable, but their implementation touches shared `app.js`, `index.html`, and `tests/app.test.js`, so implement them sequentially to avoid same-file conflicts.
- **Polish (Phase 6)**: T009 and T010 can proceed after their related controls and behavior are defined; T011 depends on all implementation, documentation, and regression tasks.

### User Story Dependencies

- **US1 (P1)**: Depends on T001; otherwise independent.
- **US2 (P1)**: Depends on T001; no product dependency on US1, but sequence after US1 for clean integration in shared files.
- **US3 (P2)**: Depends on completed US1 and US2 tests because the full-suite acceptance criterion includes both new CSV flows.

### Within Each User Story

- Add the story's contract-focused tests before implementing its behavior.
- US1: T002 precedes T003 and T004; T003 and T004 may be implemented in parallel after T002 if the control ID and handler contract are coordinated.
- US2: T005 precedes T006 and T007; T006 and T007 may be implemented in parallel after T005 if the element IDs are coordinated.
- US3: T008 is a single test-file task and has no intra-story parallel work.

### Parallel Opportunities

- T003 and T004 can run in parallel after T002 because they modify different files and share the documented export handler/element-ID contract.
- T006 and T007 can run in parallel after T005 because they modify different files and share the documented import element-ID contract.
- T009 and T010 can run in parallel because styling and requirements documentation are separate files.
- Do not parallelize tasks that both edit `tests/app.test.js` or `app.js` within the same phase.

## Parallel Examples

### User Story 1

```text
After T002 passes:
- T003: implement export serialization/download in app.js
- T004: add the export control in index.html
```

### User Story 2

```text
After T005 is written:
- T006: implement import parsing and persistence in app.js
- T007: add the import controls and live status in index.html
```

### User Story 3

T008 changes only `tests/app.test.js`, so there is no safe parallel task within this story. Run it after the CSV story tests are integrated.

## Implementation Strategy

### MVP First (User Story 1)

1. Complete T001, then T002.
2. Implement T003 and T004, then run `node tests/app.test.js`.
3. Stop at the US1 checkpoint to validate export independently.

### Incremental Delivery

1. Establish test mocks, then ship and validate export (US1).
2. Add append-only import and row/file failure handling (US2), preserving the export behavior.
3. Add explicit regression coverage for earlier tracker features (US3).
4. Complete styling, requirements documentation, and quickstart validation.

### Constitution Alignment

Tasks preserve the single-page vanilla client and localStorage requirements, avoid external dependencies, reuse small single-purpose functions, and update `docs/REQUIREMENTS.md` for the new user-visible functionality in accordance with the project constitution.
