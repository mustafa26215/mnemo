# Status

The simplification is complete and covered by `tests/run.js` (119 checks, simulated browser only).

# Still to check on real devices (not possible in the build environment)
1. Layout at phone, tablet, and desktop widths in light and dark themes; no horizontal scroll; the 6 navigation items on narrow phones.
2. Word pronunciation playback (US/UK) on iOS Safari and Android Chrome.
3. PWA installation and offline start after the first visit.

4. Bulk delete on a phone: the "Select all / N selected / Delete selected / Cancel" row wrapping on narrow screens, checkbox tap size, and the confirmation dialog in light and dark themes.
5. A card with no Arabic meaning and no example, in both themes: only the definition should show, with no divider below it.

6. First launch on a clean browser profile shows the empty states with no words; an older installation loses only its untouched sample words.
7. A leftover `lumen.vocab.v1.backup` entry from the old Undo may remain in an existing browser's storage; the app no longer reads it.

# Possible small cleanups
- `SEED` and `SX` (the old sample data) remain in `index.html` only to recognize untouched old samples. After every existing installation has been opened once, they can be deleted together with `isSampleCopy`. (not required)
- `goal` is still stored and exported for backward compatibility but no screen uses it.
- Legacy CSS was pruned automatically only where a class was unused anywhere in the file; a manual pass could remove more.
