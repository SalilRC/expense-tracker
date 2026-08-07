# Research: Expense Tracker

## Decisions

### Decision 1: Use browser localStorage for persistence
- **Decision**: Store the expense collection as a JSON array in localStorage.
- **Rationale**: This satisfies the persistence requirement without introducing a backend or additional tooling.
- **Alternatives considered**: In-memory-only state, a backend API, or IndexedDB.
- **Why rejected**: In-memory-only storage would not survive refreshes, while backend or IndexedDB approaches would add unnecessary complexity for this MVP.

### Decision 2: Keep the app as a single static page
- **Decision**: Use one HTML page that contains both the form and the report view.
- **Rationale**: This matches the requirement for a single-page experience and keeps the app simple.
- **Alternatives considered**: Multi-page navigation or a framework-based split view.
- **Why rejected**: Multi-page navigation is unnecessary for this feature, and frameworks would violate the no-build-tools constraint.

### Decision 3: Validate input before saving
- **Decision**: Validate date, description, category, and amount on form submission and show inline feedback for invalid fields.
- **Rationale**: This aligns with the constitution’s validation-first principle and produces a clearer user experience.
- **Alternatives considered**: Allowing invalid entries and filtering later.
- **Why rejected**: Invalid entries would create inconsistent report data and reduce trust in the app.
