# CSV Interchange Contract

This file contract is the user-facing boundary for exporting expenses from and importing expenses into the browser-only tracker. It does not define a network API.

## Encoding and Records

- UTF-8 text; exports include a UTF-8 byte-order mark for spreadsheet compatibility, and imports accept a leading BOM.
- Standard CSV quoting: fields containing commas, quotes, or line breaks are quoted; embedded quotes are doubled.
- Import accepts CRLF or LF record separators; export uses CRLF.
- Required header names are case-sensitive and are not trimmed; import accepts them in any order and permits additional named columns, which are ignored.
- Each required header must appear exactly once. Missing or duplicate required headers cause a file-level error and leave saved expenses unchanged.
- A leading UTF-8 BOM is ignored when matching the first header.
- Completely blank records are ignored.

## Header

- Required columns: `date`, `description`, `category`, `amount`.
- Required header names are case-sensitive and are not trimmed; import accepts them in any order and permits additional named columns, which are ignored.
- A leading UTF-8 BOM is ignored when matching the first header.
- Each required header must appear exactly once. Missing or duplicate required headers cause a file-level error and leave saved expenses unchanged.
- Export always writes the required headers in this order: `date`, `description`, `category`, `amount`.
- A header-only template named `expense-import-template.csv` is downloadable from the “CSV Import Template” link beside the import control.

## Data Values

- Surrounding whitespace is trimmed from each required field before validation; the trimmed description and category are stored.
- `date`: valid ISO calendar date formatted `YYYY-MM-DD`.
- `description`: non-empty after surrounding whitespace is trimmed.
- `category`: one of `Groceries`, `Fuel`, `Travel`, `Eating Out`, `Utilities`, `Other`, matched case-sensitively after whitespace trimming.
- `amount`: one or more digits optionally followed by a decimal point and one or more digits. Values greater than `100000` before rounding, signs, exponent notation, currency symbols, and thousands separators are rejected. Accepted values use decimal half-up rounding to two places; a value that rounds to zero or is non-finite is rejected.
- Exported amounts are plain numbers with exactly two decimal places and no currency symbol.

## Failure Behavior

- Malformed CSV syntax is a file-level error; the file is not partially imported.
- A nonblank data row with the wrong number of fields or invalid expense values is skipped; other valid rows are still imported.
- A header-only file reports zero accepted and zero skipped; completely blank data records do not affect either count.
- Successful rows append to the existing expense collection and persist through localStorage.
- Import feedback reports accepted and skipped row counts and identifies each skipped CSV record with its specific validation reason. File-level errors instead show an error and leave the collection unchanged.
- If localStorage rejects the staged update, the collection remains unchanged and a clear persistence error is shown.