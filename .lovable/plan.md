# Plan: Remove redundant zero-width character

The user's request appears to be a no-op visual edit (changing `\u2063` to `\u2063`), but given the context of the invisible character (Zero Width Space/Invisible Separator), it likely aims to remove or normalize a specific hidden character that might be causing layout or accessibility issues.

## User Review Required

> [!IMPORTANT]
> The request asks to change a hidden character to itself. I will assume the goal is to ensure no extraneous hidden characters exist in critical UI spans. If you intended a different text change, please clarify.

## Proposed Changes

### Content Normalization
- Scan `src/pages/Index.tsx`, `src/pages/Auth.tsx`, and `src/components/Navbar.tsx` for hidden characters (Unicode `\u2063` or `\u2062`).
- Remove any redundant invisible separators found in visible text spans.

## Technical Details
- Using `rg` or `grep` to locate the exact character bytes in the source code.
- Applying `sed` or `line_replace` to clean the strings.

## Verification Plan
- Use `cat -A` or a hex dump on modified files to verify the invisible character is removed.
- Check the live preview to ensure no text shifts or layout breaks occur.
