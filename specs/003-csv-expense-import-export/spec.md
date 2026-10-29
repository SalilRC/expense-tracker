# Feature Specification: CSV Expense Import and Export

**Feature Branch**: `003-csv-expense-import-export`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "Add client-side CSV export and import to the existing single-page expense tracker. Export the current expenses with date, description, category, and amount columns. Import CSV rows using existing required-field and category validation, accept plain positive numbers normalized to two decimal places, skip invalid rows and report their count, append valid rows to the existing collection, and persist them. Add automated tests for this feature and regression tests for earlier features. Preserve the existing browser-only tracker."

## Clarifications

### Session 2026-09-30

- Q: Should import accept positive amounts with more than two decimal places and round them to cents, or reject them? → A: Accept extra decimal places and round to two; reject amounts that round to zero.
- Q: Should exported amount cells always show two decimal places, such as `42.00`, or use the shortest numeric form, such as `42`? → A: Always use two decimal places, with no currency symbol.
- Q: Should imported amounts accept only ordinary decimal notation like `42` and `42.5`, or also scientific notation like `4.2e1`? → A: Accept ordinary decimal notation only; reject exponent notation, currency symbols, and thousands separators.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Export Expenses (Priority: P1)

A user can download the expenses currently recorded in the tracker as a CSV file for use outside the app or as a backup.

**Why this priority**: Users need a reliable way to take their records with them without changing the existing collection.

**Independent Test**: Record multiple expenses, export them, and verify the downloaded CSV has the expected header and one matching row per expense.

**Acceptance Scenarios**:

1. **Given** the collection contains expenses, **When** the user exports it, **Then** a CSV download contains the columns `date`, `description`, `category`, and `amount` and each current expense's corresponding values.
2. **Given** an expense field contains a comma, quote, or line break, **When** the user exports the collection, **Then** the downloaded CSV preserves that field as one correctly escaped value.
3. **Given** the collection is empty, **When** the user exports it, **Then** a CSV containing the column header is downloaded and no expense data is changed.

### User Story 2 - Import Expenses (Priority: P1)

A user can select a CSV file and add its valid expense rows to the existing collection, while being told how many rows were skipped.

**Why this priority**: Users can bring existing records into the tracker without re-entering them or losing expenses already recorded.

**Independent Test**: Import a CSV containing valid and invalid rows, then verify valid rows are appended and persisted, amounts are normalized, and the user is told the accepted and skipped counts.

**Acceptance Scenarios**:

1. **Given** a CSV with exactly one of each case-sensitive required header (`date`, `description`, `category`, and `amount`) and valid expense rows, **When** the user selects it, **Then** each row is added to the existing collection and the report updates; the required headers may be reordered and additional named columns are ignored.
2. **Given** an imported row has a valid date, non-empty description, supported category, and positive numeric amount such as `42` or `42.5`, **When** it is processed, **Then** the expense is accepted with its amount normalized to two decimal places.
3. **Given** a CSV contains both valid and invalid rows, **When** the import completes, **Then** valid rows are added, invalid rows are skipped, and the user sees the number of rows accepted and skipped.
4. **Given** a CSV row has a missing or invalid date, blank description, unsupported category, or non-positive or non-numeric amount, **When** the import is processed, **Then** that row is skipped without preventing other valid rows from being added.
5. **Given** a parseable CSV contains a row with a different number of fields than the header and at least one valid row, **When** the import is processed, **Then** the wrong-width row is skipped and counted, while valid rows are imported.
6. **Given** the user selects an empty file, a CSV with missing or duplicate required headers, malformed CSV syntax, or an unreadable file, **When** the import is attempted, **Then** the user receives a clear file-level error and the existing collection remains unchanged.
7. **Given** valid rows have been imported, **When** the user reloads the tracker, **Then** those expenses remain available and are included in the report totals.
8. **Given** the user cancels the file picker, **When** no file is selected, **Then** the existing collection remains unchanged.
9. **Given** the user selects a valid header-only CSV or a CSV containing only blank data records, **When** the import completes, **Then** the collection is unchanged and the user sees zero accepted and zero skipped rows.
10. **Given** localStorage cannot save an otherwise valid import, **When** the import is committed, **Then** no imported expense is added to the in-memory or persisted collection and the user receives a clear persistence error.
11. **Given** an imported amount is exactly `100000`, **When** its row is processed, **Then** the amount is accepted; an amount greater than `100000` before rounding is rejected and counted as a skipped row.
12. **Given** one or more data rows are skipped, **When** the import completes, **Then** the on-page result identifies each skipped CSV record and states its specific reason, such as a missing field, unsupported category, invalid amount, or wrong field count.
13. **Given** the user wants to prepare an import file, **When** they view the controls beside Import CSV, **Then** they can download a header-only CSV from a link labeled “CSV Import Template”.

### User Story 3 - Preserve Confidence in Existing Features (Priority: P2)

A user can continue to add, review, edit, and delete expenses with confidence that CSV changes have not broken the tracker's established behavior.

**Why this priority**: Import and export must extend the tracker without regressing its core record-keeping workflows.

**Independent Test**: Run automated checks covering CSV acceptance scenarios and the earlier add, report, persistence, edit, and confirmed or canceled delete behaviors.

**Acceptance Scenarios**:

1. **Given** a change is made to the tracker, **When** the automated test suite runs, **Then** it checks expense creation and validation, report totals, persistence, editing, deletion confirmation, and the CSV import and export flows.
2. **Given** the automated test suite passes, **When** users use the existing tracker workflows, **Then** valid actions continue to update the collection and report, while invalid actions leave saved data unchanged.

### Edge Cases

- An empty collection exports a header-only CSV.
- Empty files, missing or duplicate required headers, and malformed CSV syntax are file-level errors that leave the collection unchanged.
- A parseable row whose field count differs from the header is skipped and included in the skipped count; valid sibling rows are still imported.
- A header-only file and a file with only blank data records produce zero accepted and zero skipped rows; an empty file with no header is a file-level error.
- Invalid data in an individual row does not prevent other parseable rows from importing.
- CSV values containing commas, quotes, or line breaks remain intact when exported and imported.
- Zero, negative, non-numeric, or missing amounts are rejected; an amount that rounds to zero is not accepted.
- Imported amounts greater than `100000` before rounding are rejected; `100000` is the inclusive maximum.
- The file picker is canceled without changing expenses.
- A CSV with no valid expense rows reports the skipped count and leaves the existing collection intact.
- If localStorage fails while saving an import, existing in-memory and persisted expenses remain unchanged and a clear error is reported.
- Each skipped data record reports its CSV record number and specific validation reason on the page.
- A downloadable header-only import template is available next to the Import CSV control.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST let users export the current expense collection as a downloadable CSV with the columns `date`, `description`, `category`, and `amount`, in that order. Amount cells MUST use plain numeric values with exactly two decimal places and no currency symbol.
- **FR-002**: The system MUST include one CSV data row for each current expense and correctly preserve field values containing commas, quotes, or line breaks. Exported CSV MUST use UTF-8 with a leading BOM, standard CSV quoting, and CRLF record separators.
- **FR-003**: The system MUST allow users to select a UTF-8 CSV file for import; a leading BOM MAY be present and MUST be ignored. The header MUST contain exactly one case-sensitive occurrence of each required column name `date`, `description`, `category`, and `amount`; header names MUST match exactly without trimming surrounding whitespace. The required columns MAY appear in any order, and additional named columns MUST be allowed and ignored.
- **FR-004**: The system MUST validate each imported row for a valid date, non-empty description, a category that exactly matches one of the fixed values after surrounding whitespace is trimmed, and a positive numeric amount. Category matching MUST be case-sensitive.
- **FR-005**: The system MUST accept positive amounts written as one or more digits optionally followed by a decimal point and one or more digits, up to and including `100000` before rounding. The system MUST reject amounts greater than `100000`, exponent notation, signs, currency symbols, and thousands separators. Accepted amounts MUST be rounded to two decimal places using decimal half-up rounding; amounts that round to zero or cannot be represented as a finite number MUST be rejected.
- **FR-006**: The system MUST skip rows with invalid expense fields or a field count different from the header while continuing to process other valid rows, and MUST report the accepted and skipped row counts in a visible import-status message adjacent to the import control. For each skipped nonblank record, the message MUST identify its CSV record number and the specific reason it was skipped. Completely blank records MUST be ignored and excluded from both counts. A valid header-only file MUST report zero accepted and zero skipped rows.
- **FR-007**: The system MUST assign each imported expense a unique identifier, append it to the existing collection, preserve existing expenses, update the report, and persist accepted expenses so they remain available after reload.
- **FR-008**: The system MUST leave the existing collection unchanged when the user cancels file selection or selects an empty file, a file with missing or duplicate required headers, malformed CSV syntax, or an unreadable file. The system MUST provide clear feedback for file-level errors. A parseable row with a field count different from the header MUST be treated as an invalid row under FR-006, not as a file-level error.
- **FR-009**: The system MUST support the fixed categories Groceries, Fuel, Travel, Eating Out, Utilities, and Other for imported records.
- **FR-010**: The system MUST remain within the existing single-page, browser-only tracker experience and MUST NOT require a backend service.
- **FR-011**: The automated test suite MUST cover the CSV import and export acceptance scenarios and regression coverage for valid and invalid expense creation, report totals, persistence after reload, valid and invalid edits, confirmed deletion, and canceled deletion.
- **FR-012**: If localStorage fails while an import is being saved, the system MUST leave the in-memory and persisted expense collections unchanged and show a clear persistence error.
- **FR-013**: The import control MUST be keyboard-operable, and import result and error messages MUST be available to assistive technology.
- **FR-014**: The system MUST provide a downloadable, header-only CSV template named `expense-import-template.csv` with the required columns in the import order `date`, `description`, `category`, `amount`. A link labeled “CSV Import Template” MUST appear beside the Import CSV control.

### Key Entities *(include if feature involves data)*

- **Expense**: A spending record with a unique identifier, date, description, category, and amount. Imported expenses receive identifiers using the existing expense model.
- **CSV File**: A tabular representation of expense records with the required four column names and one record per expense.
- **Import Result**: The outcome of processing a selected file, including accepted and skipped row counts or a file-level error.
- **Expense Collection**: The existing set of expenses, to which accepted imports are appended.
- **Spending Summary**: The category totals and grand total derived from the current expense collection.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every export contains the four required columns and exactly one data row for each expense in the collection at export time, including when the collection is empty.
- **SC-002**: 100% of valid imported rows are appended and available after reload, with accepted amounts represented to two decimal places.
- **SC-003**: Every invalid import row is excluded, valid rows in the same file are still imported, and the user is shown the correct accepted and skipped counts.
- **SC-004**: Automated tests cover all CSV acceptance scenarios and the specified regression behaviors for the earlier features, and pass before the feature is considered complete.
- **SC-005**: After a successful import, report category totals and the grand total reflect the updated collection without requiring a page reload.
- **SC-006**: Every skipped nonblank data record is reported with its record number and a specific reason that identifies what the user can correct.
- **SC-007**: Users can download a header-only CSV template with the four required columns from the Import CSV controls.

## Assumptions

- Imported files MUST be UTF-8 and MAY have a leading BOM. CSV values follow standard quoting rules; imports accept CRLF or LF record separators, while exports use CRLF. Surrounding whitespace is trimmed from required data fields, not header names.
- Amount text MUST contain one or more digits and MAY contain a decimal point followed by one or more digits; `.5`, `42.`, and leading signs are invalid. Exact half-cent amounts round up to the next cent.
- The maximum imported numeric amount before rounding is `100000`, inclusive; an input above that value is invalid even if it would round down to `100000.00`.
- Positive numeric amounts with more than two decimal places are rounded to two decimal places; values that round to zero are invalid.
- A file-level parsing or header error prevents that file from being imported, while invalid individual rows are skipped independently.
- A header-only file and a file containing only blank data records are valid imports with zero accepted and zero skipped rows; a zero-byte file is a file-level error.
- No maximum CSV file size is imposed for this version; files are intended to contain ordinary personal expense records and are processed in the browser.
- The supported browser must provide local file selection and reading, and client-side file downloads.
- The existing fixed category list and expense validation rules remain authoritative for imported data.
- The tracker continues to serve one user's browser-local expense collection; import and export do not provide synchronization or sharing between users or devices.