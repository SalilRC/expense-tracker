# Research: Edit and Delete Expenses

## Decisions

### Decision 1: Reuse the existing form for editing
- **Decision**: Use the existing add-expense form in edit mode so the user can update the expense with the same validation rules and UX.
- **Rationale**: This keeps the UI simple and avoids adding a second, redundant form while keeping validation consistent.
- **Alternatives considered**: A separate edit modal or a dedicated edit page.
- **Why rejected**: A separate modal would add extra UI complexity, and a separate page would break the single-page flow and violate the app’s current pattern.

### Decision 2: Add action buttons directly to each expense row
- **Decision**: Render an Edit button and a Delete button next to each expense entry in the report list.
- **Rationale**: This gives a clear, discoverable action for each record and supports a lightweight list-view workflow.
- **Alternatives considered**: Context menus or inline row actions hidden behind a menu.
- **Why rejected**: Those approaches are less obvious and create unnecessary interaction overhead for a simple tracker.

### Decision 3: Recalculate totals from the collection after every successful mutation
- **Decision**: After any successful add, edit, or delete, regenerate category totals and the grand total from the current expense array.
- **Rationale**: This matches the app’s current architecture, avoids state drift, and keeps the UI consistent with localStorage.
- **Alternatives considered**: Mutating totals directly in state.
- **Why rejected**: Direct mutation risks stale totals and makes invalid updates harder to reason about.

### Decision 4: Keep the validation contract identical for add and edit
- **Decision**: Reuse the same validation function and error messaging for both creating and updating expenses.
- **Rationale**: This reduces bugs and ensures the user has one consistent model for entering and correcting data.
- **Alternatives considered**: Separate edit-only validation logic.
- **Why rejected**: Divergent validation rules would create confusing behavior and inconsistent data quality.
