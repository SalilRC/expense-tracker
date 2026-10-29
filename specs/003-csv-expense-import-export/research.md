# Research: CSV Expense Import and Export

## Decisions

### CSV Parsing and Serialization

- **Decision**: Use a small vanilla JavaScript CSV state machine that supports UTF-8 input, standard quoted fields, doubled quote escapes, commas, CRLF/LF record endings, and line breaks inside quoted fields. Serialize UTF-8 records with a BOM, the same quoting rules, and CRLF record separators.
- **Rationale**: The feature must preserve commas, quotes, and line breaks, while the constitution prohibits adding external libraries or build dependencies. A state machine can distinguish a file-level malformed-quote error from a valid record containing quoted line breaks.
- **Alternatives considered**: Splitting text on lines or commas was rejected because it corrupts quoted fields. A third-party CSV package was rejected by the project constitution.

### Header and Record Validation

- **Decision**: Require one each of the exact, case-sensitive `date`, `description`, `category`, and `amount` headers, in any order, without trimming header whitespace; remove a leading UTF-8 BOM before matching the first header. Allow additional named columns and ignore them. Treat duplicate/missing required headers and malformed CSV syntax as file-level errors. Treat rows whose field count differs from the header as invalid rows.
- **Rationale**: This honors the required-column contract and supports CSVs with additional data without misaligning the four expense fields. File syntax and header failures prevent reliable row interpretation, so they must be detected before mutation; an isolated wrong-width row can be skipped and counted.
- **Alternatives considered**: Requiring a fixed column order was rejected because the spec permits any order. Rejecting every extra column was rejected because the file contract only requires the four named columns. Guessing how to recover after malformed quoting was rejected because later record boundaries become ambiguous.

### Import Validation and Mutation

- **Decision**: Trim surrounding whitespace from imported data fields, but not header names; store the trimmed description and canonical category. Match categories case-sensitively. Validate ISO calendar dates, descriptions, and categories with the same rules as the existing add/edit flow. Before numeric conversion, require one or more digits with an optional decimal point followed by one or more digits; reject signs, exponent notation, currency symbols, and thousands separators. Require a positive finite value no greater than `100000` before rounding, round decimal half-cent ties up to two decimals, and reject values that round to zero. Parse the full file and validate all rows before saving the staged collection; update in-memory state and render only after localStorage succeeds.
- **Rationale**: Existing validation owns the date and required-description semantics; the fixed category set is matched exactly after trimming. The import-specific amount syntax honors the clarification while avoiding JavaScript `Number()` accepting exponent strings. Staging and persisting before changing in-memory state makes file-level and storage failures atomic while still allowing invalid individual rows to be skipped.
- **Alternatives considered**: Reusing `Number()` alone was rejected because it accepts exponent syntax. Saving after each accepted row was rejected because a later file-level error could leave a partial import. Omitting an upper bound was rejected because imported amount limits need to be deterministic and testable.

### Row Counting and Feedback

- **Decision**: Ignore completely blank records; a header-only file reports zero accepted and zero skipped. Count each nonblank row with invalid fields or wrong width as skipped, and include that CSV record number plus a field-specific correction reason in the accessible status message. Report a clear file-level error and do not change state for zero-byte/unreadable files, malformed CSV, invalid headers, or localStorage write failure. Reset the file input after handling so the same file can be selected again.
- **Rationale**: Blank physical lines are not expense rows, while every parseable nonblank data row has a determinate accepted/skipped outcome. Distinct file-level feedback avoids reporting a misleading row count when the file cannot be interpreted.
- **Alternatives considered**: Counting blank lines as skipped was rejected because it makes the count depend on CSV formatting rather than expense records. Partially accepting a file with malformed syntax was rejected because record boundaries cannot be trusted.

### Browser File Import and Download

- **Decision**: Support current browsers with local file selection/reading and client-side downloads. Place a link labeled “CSV Import Template” beside the Import CSV control; it downloads the header-only `expense-import-template.csv`. Use a hidden CSV file input and a visible import button; export UTF-8 CSV with a BOM, CRLF record separators, a fixed `expenses.csv` filename, a browser Blob, a temporary object URL, and a programmatically activated download link. Emit amounts as plain decimal strings with exactly two digits after the decimal point and no currency symbol.
- **Rationale**: These built-in APIs meet the no-backend and no-dependency constraints. The BOM improves compatibility with spreadsheet applications for non-ASCII descriptions; import strips it before matching the first header. Fixed decimal formatting follows the clarification and makes amount values predictable.
- **Alternatives considered**: Sending data to a backend or using a server-generated export violates the architecture. A data URI was rejected in favor of Blob/object URL support for arbitrary file size within normal client-side use.

### Expense Identity and Regression Tests

- **Decision**: Assign imported records unique IDs consistent with the existing expense entity, checking against existing and staged IDs. Extend `tests/app.test.js` and its VM browser mocks rather than adding a test framework or dependency. Add regression checks for existing creation/validation, totals, localStorage persistence, edit, and confirmed/canceled deletion.
- **Rationale**: IDs are required by existing edit/delete behavior, and rapid imports can create multiple records in one event. The current standalone Node assertion harness already exercises application functions and runs without a package install.
- **Alternatives considered**: Adding a new framework or separate test project was rejected as unnecessary and contrary to the dependency-free constitution. Replacing the current suite was rejected because it already contains useful regression coverage.

## Deferred Considerations

- No maximum CSV file size or performance target is specified. Keep implementation simple for ordinary personal expense files; revisit only if product usage establishes a large-file requirement.