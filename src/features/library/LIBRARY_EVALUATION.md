# Library Feature – Evaluation & Status

## Current State (post–confirmed changes)

### Done

| # | Item | Status |
|---|------|--------|
| 1 | **Error handling** | `useLibraryQuery` returns `{ data, isLoading, error }`; `LibraryPage` shows `<Alert severity="error">` when `error` is set. |
| 2 | **useLibraryQuery cleanup** | Effect cleanup calls `clearTimeout(debounceRef.current)` so the debounced callback does not run after unmount or stale filters. |
| 8 | **LibraryList key** | Row-unique key: `item.gameInstanceUid ?? \`game-${item.gameUid}\``. |
| 9 | **LibraryListItem** | Links to `/games/:uid` and “View instance” → `/game-instances/:uid`; completion state **name** from reference data; formatted playtime (`formatPlaytime`); thumbnail when `thumbnailImageUid` (via `/api/thumbnails/:uid`). |
| 10 | **Single source GameOverviewRowDto** | Type lives only in `library/types.ts`; comment documents single source of truth. |
| 11 | **Empty state** | “No games match your filters.” + “Clear filters” when `hasActiveFilters`; “No games in library.” otherwise. `hasActiveFilters()` in `urlFilters.ts`. |

### Still recommended (optional)

| Priority | # | Item | Notes |
|----------|---|------|--------|
| **Medium** | 3 | **URL ↔ filters sync** | Two effects (URL→filters, filters→URL). On first load, filters→URL can overwrite the URL. Either document “we normalize URL on load” or run filters→URL only when user changes filters (e.g. ref). |
| **Medium** | 4 | **Filters ↔ UI parity** | `consoleUids`, `inBacklog`, `hasActivePlaythrough` are in state/URL but have no controls in `LibraryFilters`. Add Console + optional backlog/active toggles, or drop from URL. |
| **Medium** | 5 | **Platform/Completion “All”** | Add explicit “All” option (empty value → `[]`). Consider multi-select or rename to `platformUid`/`completionStateUid` if single only. |
| **Medium** | 6 | **LibraryFilters robustness** | Use `as SortMode` (or type guard) for sort; filter platforms by `hideInChoices`; add stable `id`/`labelId` for a11y and tests. |
| **Low** | 7 | **urlFilters parsing** | `split(',')` can yield `['']`. Use `.filter(Boolean)` (e.g. `p.get('platforms')?.split(',').filter(Boolean) ?? []`) for platforms, consoles, completion. |
| **Optional** | 12 | **LibraryStates** | Reuse a shared loading/empty/error component for consistency with other list screens; current inline approach is fine. |

---

## Summary

- **High-priority items (1, 2)** and **list/item/empty improvements (8, 9, 10, 11)** are implemented. The library feature is in good shape for production use.
- Remaining items are **medium/low/optional**: URL sync behavior, filter UI parity, “All” options, sort typing, `hideInChoices`, url param normalization, and optional `LibraryStates`. Tackle these when you want tighter UX or consistency with other pages.
