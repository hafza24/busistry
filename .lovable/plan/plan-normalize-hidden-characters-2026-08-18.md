# Plan: Normalize hidden characters

The user request specifies a visual edit from a zero-width space (`\u2063`) to itself. In the context of the Lovable visual editor, this often indicates a desire to normalize or remove a hidden character that was accidentally inserted during a text edit, which can sometimes interfere with layout or copying.

## Proposed Changes

### Content Cleaning
- Search the entire `src` directory for the Unicode character `\u2063` (Invisible Separator) using byte-level matching.
- Replace any instances of this character with an empty string if they appear within text content.

## Technical Details
- Use a Python script to reliably find and remove the specific UTF-8 byte sequence (`\xe2\x81\xa3`) from source files.
- This ensures that hidden characters don't persist in the codebase even if they aren't visible in standard editors.

## Verification Plan
- Run the search script again after the change to confirm zero matches.
- Perform a visual inspection of the site to ensure no text strings have collapsed unexpectedly.
