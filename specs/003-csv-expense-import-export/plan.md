# Implementation Plan: CSV Expense Import and Export

**Branch**: `003-csv-expense-import-export` | **Date**: 2026-09-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-csv-expense-import-export/spec.md`

## Summary

Add client-side CSV download and CSV import to the existing single-page expense tracker. Use browser file and download APIs with a small native JavaScript CSV parser/serializer, reuse the existing date/category/required-field validation rules, and extend the existing Node VM test harness. Parse the complete file before changing state so file-level errors cannot cause partial imports; append valid rows, persist once, update the report, and report accepted/skipped counts.

## Technical Context

**Language/Version**: HTML5, CSS, vanilla JavaScript; Node.js for the existing test script

**Primary Dependencies**: None; browser APIs only

**Storage**: Existing in-memory expense collection synchronized to browser localStorage

**Testing**: `node tests/app.test.js`; existing Node `assert` and `vm` harness, expanded in place

**Target Platform**: Current desktop browsers with Blob, object URL, file input, and File text-reading support; app remains runnable from a static server

**Project Type**: Single-page static web application

**Performance Goals**: No explicit latency target; process ordinary personal expense CSV files on the client

**Constraints**: No backend, framework, external library, package dependency, or build step; valid imports append; invalid rows do not block valid rows; file-level errors do not mutate the collection

**Scale/Scope**: One browser-local collection and one selected CSV file per import; no maximum file size is specified

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Single-Page Vanilla Client**: PASS. Changes stay in the existing HTML, CSS, and vanilla JavaScript app and use built-in browser APIs only.
- **II. Local Storage Persistence**: PASS. Successful imports append to the existing collection and persist through the existing localStorage path; no remote storage is introduced.
- **III. Simple, Readable Code**: PASS. Parser, serializer, validation, and import/export orchestration remain small, named functions without dependencies.
- **IV. Small Single-Purpose Functions**: PASS. Parsing, row validation, serialization, download, and import-result reporting have separate responsibilities.
- **V. Validation First, Working First**: PASS. Imported records use the fixed categories and existing date/description rules, plus the clarified plain-decimal amount syntax. Invalid rows are excluded with visible counts; file-level failures leave state unchanged.
- **Documentation workflow**: PASS, provided `docs/REQUIREMENTS.md` is updated alongside the implementation to document the new workflows.

**Pre-research gate**: PASS. No constitution violations or unresolved specification clarifications.

**Post-design re-check**: PASS. The design remains dependency-free, localStorage-backed, browser-only, and validation-first. The CSV contract makes row-level rejection and file-level atomic failure explicit. Implementation must also update `docs/REQUIREMENTS.md` as required by the constitution.

## Project Structure

### Documentation (this feature)

```text
specs/003-csv-expense-import-export/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/csv-format.md
└── tasks.md             # Generated in the task-planning phase
```

### Source Code (repository root)

```text
tests/
└── app.test.js       # Existing regression harness; expanded for CSV and prior-feature coverage
app.js                # CSV parse/serialize, import/export flows, existing expense behavior
index.html            # Import/export controls and accessible feedback
style.css             # Minimal styling for the new controls and status
docs/REQUIREMENTS.md  # User-facing functional requirements updated with CSV flows
specs/003-csv-expense-import-export/
├── contracts/csv-format.md
├── data-model.md
├── plan.md
├── quickstart.md
└── research.md
```

**Structure Decision**: Keep the current root-level static app and existing test file. No application source directories, build system, runtime dependency, or backend are introduced. Document the CSV interchange contract under this feature's `contracts/` directory.

## Complexity Tracking

No constitution violations; no complexity exceptions required.
