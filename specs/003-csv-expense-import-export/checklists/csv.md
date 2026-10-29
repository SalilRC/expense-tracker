# CSV Requirements Checklist: CSV Expense Import and Export

**Purpose**: Assess whether CSV import/export requirements are complete, clear, consistent, and measurable
**Created**: 2026-09-30
**Feature**: [spec.md](../spec.md)

**Note**: This checklist evaluates requirements quality, not whether the implementation works.

## Requirement Completeness

- [x] CHK001 Are import header matching rules defined for case, surrounding whitespace, duplicate required headers, and additional columns? [Completeness, Ambiguity, Spec §FR-003, Assumptions]
- [x] CHK002 Are blank records explicitly classified, including whether they affect accepted or skipped counts? [Gap, Spec §FR-006, Edge Cases]
- [x] CHK003 Are encoding expectations for imported files and exported files specified consistently? [Gap, Consistency, Spec §FR-001, FR-003]
- [x] CHK004 Are requirements defined for storage failures during import, including whether accepted rows remain only in memory or are rolled back? [Gap, Exception Flow, Spec §FR-007]

## Requirement Clarity

- [x] CHK005 Is the phrase "ordinary decimal notation" defined with explicit accepted forms, such as whether `.5`, `42.`, or a leading plus sign is valid? [Ambiguity, Spec §FR-005]
- [x] CHK006 Is the rounding rule for exact half-cent values specified so accepted amounts have deterministic results? [Clarity, Spec §FR-005]
- [x] CHK007 Are category matching rules explicit about capitalization and surrounding whitespace? [Clarity, Spec §FR-004, FR-009, Assumptions]
- [x] CHK008 Is the user-facing content and presentation location of accepted/skipped counts defined clearly enough to distinguish the two outcomes? [Clarity, Spec §FR-006]

## Requirement Consistency

- [x] CHK009 Do the edge-case requirements distinguish a malformed file from a parseable row with the wrong number of fields, consistently specifying whether valid sibling rows are retained? [Consistency, Conflict, Spec §FR-006, FR-008, Edge Cases]
- [x] CHK010 Are CSV quoting, line-ending, encoding, and header rules consistent between the specification and the CSV contract? [Consistency, Spec §FR-002, FR-003, Assumptions]

## Acceptance Criteria Quality

- [x] CHK011 Can accepted and skipped row counts be objectively determined for files containing only invalid rows, blank rows, or no data rows? [Measurability, Spec §FR-006, SC-003]
- [x] CHK012 Can the required regression coverage be mapped to specific earlier-feature acceptance scenarios, including invalid submissions and canceled deletion? [Traceability, Spec §FR-011, User Story 3]

## Scenario Coverage

- [x] CHK013 Are file-picker cancellation, unreadable files, malformed CSV, missing or duplicate headers, and row-level validation failures covered as distinct scenarios? [Coverage, Spec §FR-008, Edge Cases]
- [x] CHK014 Are accessibility requirements for selecting a file and receiving import results specified? [Gap, Accessibility, Spec §FR-003, FR-006]

## Edge Case Coverage

- [x] CHK015 Has the product set a maximum imported expense amount, or explicitly chosen not to impose a product-level upper limit? [Product Decision, Edge Case, Spec §FR-005]

## Non-Functional Requirements

- [x] CHK016 Is the intended CSV size or an explicit absence of a size limit defined so client-side processing expectations are bounded? [Gap, Assumption, Spec §SC-002, Assumptions]

## Dependencies & Assumptions

- [x] CHK017 Are supported browser capabilities for local file selection and download documented as a compatibility assumption? [Dependency, Gap, Spec §FR-003, FR-010]

## Ambiguities & Conflicts

- [x] CHK018 Do the specification and plan agree on whether extra columns and duplicate required headers are accepted or treated as file-level errors? [Conflict, Spec §FR-003, Assumptions]
- [x] CHK019 Does the specification require each skipped row to include its record number and a specific correction reason? [Completeness, Clarity, Spec §FR-006]
- [x] CHK020 Does the specification define the downloadable import template's filename, required headers, and on-page label/location? [Completeness, Spec §FR-014]

## Notes

- Check an item only after the referenced requirements have been reviewed and found clear, complete, consistent, and measurable.
- Items marked [Gap], [Ambiguity], or [Conflict] identify requirement-writing questions for resolution, not implementation defects.