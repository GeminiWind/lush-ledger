# Data Model: Ledger Transaction Display Groups

## Transaction

### Purpose

Represents one ledger record that can be placed under a date header in the activity list.

### Fields

- `id`: string - unique transaction identifier.
- `date`: datetime - source field used to derive day grouping and display header.
- `amount`: decimal - transaction value shown in row.
- `type`: enum - transaction type used for icon/sign styling.
- `account.name`: string - account label shown in row.
- `category.name`: string|null - category label shown in row metadata.
- `notes`: string|null - optional fallback subject/detail text.

### Constraints

- `date` must be present and parseable for correct grouping (FR-001).
- Invalid dates must not be mis-grouped (FR-002).
- Records must remain user-scoped by existing permissions (FR-007).

### Relationships

- Belongs to one authenticated user (enforced by existing backend scoping).
- References one account; optionally references one category.

---

## Display Group

### Purpose

UI-only grouping construct used to organize transactions into readable date sections.

### Fields

- `key`: string - stable grouping key derived from calendar date.
- `label`: string - visible header (`Today`, `Yesterday`, or locale-formatted date).
- `items`: Transaction[] - transactions assigned to this header.
- `position`: integer - ordering rule sequence in rendered list.

### Constraints

- Top ordering must place `Today` before `Yesterday`, before older dates (FR-003).
- Older dates must appear as direct calendar-date headers, not nested (FR-004).
- Older date labels must follow authenticated user's locale (FR-013).
- Empty groups must be hidden (FR-009).

### Relationships

- One display group contains many transactions.
- One transaction maps to exactly one display group in a render pass.

### Lifecycle

- Created during each render/recompute.
- Recomputed when visible transaction dataset changes.
- Discarded and regenerated on next refresh/filter/search.
