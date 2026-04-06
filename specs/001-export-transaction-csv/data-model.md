# Data Model: Export Transaction CSV

## Overview

This feature does not introduce new persisted database tables. It defines export-focused domain representations derived from existing `Transaction`, `Account`, `Category`, and `UserSettings` data.

## Entities

### 1) TransactionExportRequest

- **Purpose**: Captures user intent and filter scope for a CSV export.
- **Fields**:
  - `userId` (string, required): authenticated user identity for scoping.
  - `query` (string, optional): free-text filter aligned with ledger search behavior.
  - `type` (enum, optional): transaction type filter.
  - `accountId` (string, optional): account filter.
  - `categoryId` (string, optional): category filter.
  - `startDate` (date, optional): inclusive export start date.
  - `endDate` (date, optional): inclusive export end date.
- **Validation rules**:
  - Must require authenticated `userId`.
  - If provided, `type` must be one of supported transaction types.
  - If both dates are present, `startDate` must be <= `endDate`.
  - If provided, `accountId` and `categoryId` must belong to `userId`.

### 2) ExportableTransaction

- **Purpose**: Canonical transaction projection used before CSV serialization.
- **Fields**:
  - `transactionId` (string)
  - `transactionDate` (date-time)
  - `accountName` (string)
  - `categoryName` (string | null)
  - `transactionType` (enum)
  - `description` (string | null)
  - `amount` (decimal rendered as string for export)
  - `currency` (string)
- **Source mapping**:
  - Uses `Transaction` joined to `Account`, `Category`, and user currency setting.
- **Validation rules**:
  - Every row must map to exactly one user-scoped transaction.
  - `amount` output must preserve decimal precision semantics from source value.

### 3) CsvExportFile

- **Purpose**: Downloadable artifact returned to the user.
- **Fields**:
  - `fileName` (string): deterministic, date-scoped export name.
  - `headerColumns` (ordered list of strings)
  - `rows` (ordered list of CSV row strings)
  - `rowCount` (number)
  - `generatedAt` (date-time)
- **Validation rules**:
  - Must always include header row, even if `rowCount = 0`.
  - Must escape delimiters, quotes, and line breaks per CSV rules.
  - Must preserve column order across all exports.

## Relationships

- One `TransactionExportRequest` generates one `CsvExportFile`.
- One `CsvExportFile` contains zero to many `ExportableTransaction` rows.
- Each `ExportableTransaction` belongs to exactly one authenticated user and must never cross user boundaries.

## State Transitions

### Export lifecycle

1. `requested` -> request received with auth and filters.
2. `validated` -> filter inputs pass validation and user scoping checks.
3. `generated` -> CSV content built successfully.
4. `delivered` -> file response returned to client.

### Failure transitions

- `requested` -> `rejected_unauthorized` when no valid session.
- `validated` -> `rejected_invalid_filters` when filter constraints fail.
- `validated` -> `failed_generation` for transient generation/IO errors.
