---
name: table-array-alignment
description:
  'Format nested arrays and matrices as aligned table-style columns. Use when
  asked to align values vertically, or when // TABLE-START and // TABLE-END
  markers are present.'
argument-hint:
  'Describe the target file/block and whether to align all rows or only
  marker-bounded regions.'
---

# Table Array Alignment

Format list and matrix literals so each item in a column lines up vertically
with the same-position item in other rows.

## When To Use

- User asks to format arrays, lists, or matrices as tables.
- Source contains `// TABLE-START` and `// TABLE-END` markers.

## Inputs To Confirm

- Target scope: one variable, one block, or all table blocks.
- Alignment mode: marker-bounded only, or explicit user-selected block.
- Padding style: spaces only.

## Defaults

- If markers are absent, format only the current selection (not the full file).
- Use exactly one separator space between aligned columns.
- Apply `// prettier-ignore` only to the primary aligned data constant.

## Procedure

1. If told to format all files, apply the following steps to each file.
   Otherwise, apply only to the specified block or selection.
2. Locate candidate blocks.
3. Add `// TABLE-START` and `// TABLE-END` markers around block if not already
   present.
4. Prefer marker-bounded formatting when `// TABLE-START` and `// TABLE-END`
   exist.
5. Otherwise format only the user-requested array/matrix block, not unrelated
   arrays.
6. Parse each row as ordered items and preserve row order.
7. Compute per-column display widths using the rendered source tokens.
8. Rebuild rows with spaces so each column starts at the same position across
   rows.
9. Preserve trailing commas and existing quote style.
10. If a row is a commented line with header names, align them as well.
11. If the header is for a numeric column, right align it. Otherwise, left
    align.
12. For string headers, align with the actual string value, not the quote
    character.
13. For quoted string columns, compute alignment by value-start index: if a row
    token starts with a quote, the column value starts one character after that
    quote. Header start must match this value-start index.
14. For quoted string columns, pad spaces between tokens so all first value
    characters in the column line up vertically.
15. For numeric columns, right align the value characters in the numeric width.
16. For numeric headers, align the header label to the numeric right edge:
    header end index must match the rightmost digit column.
17. Keep at least one space between adjacent header names.
18. If the header is right aligned, allow it to flow into the column header to
    the left of it if needed to avoid excessive padding. Just make sure the
    header has room for at least one space between it and the next column.
19. Add `// prettier-ignore` immediately above the narrowest applicable variable
    declaration or code block.
20. Do not place a file-wide ignore when a single declaration-level ignore is
    enough.
21. Re-check the result for stable alignment and unchanged semantics.

## Decision Points

- If markers exist: only format inside marker bounds.
- If markers do not exist: format only the current selection or explicitly
  requested block.
- If value is a number, right align it. Otherwise, left align.
- If value is a quoted string, align by first value character, not quote
  character.
- If rows have different lengths: align shared columns and keep remaining
  trailing items unchanged.
- If nested arrays exist: align the intended level only; avoid collapsing nested
  structure.
- If computed alignment would reduce readability for very long values: keep
  structure readable and avoid excessive padding.

## Quality Checks

- Columns are visually aligned top-to-bottom.
- Header names are aligned to value starts, not token delimiters.
- String-header start index equals string value-start index.
- Numeric-header end index equals numeric value right-edge index.
- TABLE-START and TABLE-END markers are present and respected if they were in
  the input.
- Item order is unchanged.
- Values and commas are unchanged except spacing.
- `// prettier-ignore` appears only where needed, directly above the relevant
  declaration.
- No unrelated reformatting outside target scope.

## Example

Before:

```ts
const rows = [
  //  char, name, char, speed, weapon
  ['G', 'goblin', 20, 'club'],
  ['O', 'orc', 8, 'axe'],
  ['g', 'gnome', 15, 'dagger'],
]
```

After:

```ts
// prettier-ignore
const rows = [
// TABLE-START
//  char name  speed   weapon
  ['G', 'goblin', 20, 'club'],
  ['O', 'orc',     8, 'axe'],
  ['g', 'gnome',  15, 'dagger'],
// TABLE-END
]
```

## Completion Criteria

- Requested scope is aligned.
- Marker semantics are honored when present.
- Prettier ignore is minimal and local.
- Output is ready to commit with no manual spacing cleanup required.
