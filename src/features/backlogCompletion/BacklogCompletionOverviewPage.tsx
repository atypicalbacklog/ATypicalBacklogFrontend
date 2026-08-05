import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { initialFetchBegin, initialFetchEnd } from '../../app/initialFetchGuard';
import { fetchBacklogOverview } from '../../services/backlogOverviewApi';
import { fetchBacklogCompletionGameOverview, fetchGamePlayedPerYear } from '../../services/statisticsApi';
import type {
  BacklogCompletionGameOverviewDto,
  GamePlayedPerYearDto,
} from '../../services/statisticsApi';
import type { BacklogFilterState } from '../backlog/types';
import SmartImage from '../shared/SmartImage';
import { countUniqueGames, uniqueGamesByUid } from '../statistics/backlogChangesUtils';
import YearlyReviewYearSelector from '../yearlyReview/YearlyReviewYearSelector';
import { gameInstanceTo, createGameInstanceReturnState } from '../gameInstances/gameInstanceNavigation';

const MIN_YEAR = 2017;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from(
  { length: CURRENT_YEAR - MIN_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i
);

const EMPTY_BACKLOG_FILTERS: BacklogFilterState = {
  searchText: '',
  consoleUids: [],
  platformUids: [],
  hasActivePlaythrough: null,
  completionStateUids: [],
};

/** Solid panels so patterned page background does not show through. */
const solidSegmentSx = {
  bgcolor: 'rgba(50, 50, 50, 1)',
  backdropFilter: 'none',
  backgroundImage: 'none',
} as const;

function yearFromDate(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const y = parseInt(dateStr.slice(0, 4), 10);
  return Number.isNaN(y) ? null : y;
}

function isInYear(dateStr: string | null, year: number): boolean {
  const y = yearFromDate(dateStr);
  return y === year;
}

function formatPlaytimeHours(seconds: number): string {
  const h = Math.round(seconds / 3600);
  return h > 0 ? `${h}h` : '<1h';
}

function MetricStat({
  label,
  value,
  color,
  tooltip,
}: {
  label: string;
  value: ReactNode;
  color?: string;
  tooltip?: string;
}) {
  const labelEl = (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        cursor: tooltip ? 'help' : 'default',
        width: 'fit-content',
      }}
    >
      {label}
    </Typography>
  );

  return (
    <Box>
      {tooltip ? (
        <Tooltip
          title={tooltip}
          arrow
          enterDelay={200}
          slotProps={{
            tooltip: { sx: { whiteSpace: 'pre-line', maxWidth: 280 } },
          }}
        >
          {labelEl}
        </Tooltip>
      ) : (
        labelEl
      )}
      <Typography
        component="span"
        sx={{ color: color ?? 'text.primary', fontWeight: 'bold' }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function BacklogCompletionOverviewPage() {
  const location = useLocation();
  const instanceReturn = createGameInstanceReturnState(location);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [rows, setRows] = useState<BacklogCompletionGameOverviewDto[]>([]);
  const [gamesPlayedPerYear, setGamesPlayedPerYear] = useState<GamePlayedPerYearDto[]>([]);
  const [gamesInBacklogCount, setGamesInBacklogCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, playedData] = await Promise.all([
        fetchBacklogCompletionGameOverview(year),
        fetchGamePlayedPerYear(year),
      ]);
      setRows(overviewData);
      setGamesPlayedPerYear(playedData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    const key = `backlog-completion-overview-${year}`;
    if (!initialFetchBegin(key)) return;
    load().finally(() => initialFetchEnd(key));
  }, [load, year]);

  useEffect(() => {
    const key = 'backlog-completion-games-in-backlog';
    if (!initialFetchBegin(key)) return;
    fetchBacklogOverview(EMPTY_BACKLOG_FILTERS)
      .then((data) => setGamesInBacklogCount(data.length))
      .catch(() => setGamesInBacklogCount(null))
      .finally(() => initialFetchEnd(key));
  }, []);

  const addedThisYear = uniqueGamesByUid(rows, (r) => isInYear(r.addedToBacklog, year));
  const removedThisYear = uniqueGamesByUid(rows, (r) => isInYear(r.removedFromBacklog, year));
  const removedFromSameYear = removedThisYear.filter((r) =>
    isInYear(r.addedToBacklog, year)
  );
  const removedFromPast = removedThisYear.filter(
    (r) => !isInYear(r.addedToBacklog, year)
  );
  const newCount = addedThisYear.length;
  const forFreeNewCount = countUniqueGames(
    rows,
    (r) => isInYear(r.addedToBacklog, year) && r.forFree
  );
  const paidNewCount = newCount - forFreeNewCount;
  const removedFrom2026Count = removedFromSameYear.length;
  const removedFromPastCount = removedFromPast.length;
  const conclusion = newCount - (removedFrom2026Count + removedFromPastCount);
  const finishedThisYear = uniqueGamesByUid(rows, (r) => isInYear(r.finishedDate, year));
  const completedThisYear = uniqueGamesByUid(rows, (r) => isInYear(r.completedDate, year));
  const finishedCount = finishedThisYear.length;
  const completedCount = completedThisYear.length;
  const removedWithoutFinishOrCompleteCount = removedThisYear.filter(
    (r) => !isInYear(r.finishedDate, year) && !isInYear(r.completedDate, year)
  ).length;
  const finishedConclusion =
    (conclusion > 0 ? -conclusion : conclusion) + finishedCount;
  const completionTotal =
    (conclusion > 0 ? -conclusion : conclusion) + finishedCount + completedCount;

  const receivedThisYear = uniqueGamesByUid(rows, (r) => isInYear(r.receivedDate, year));
  const removedGameUids = new Set(removedThisYear.map((r) => r.gameUid));
  const finishedGameUids = new Set(finishedThisYear.map((r) => r.gameUid));
  const group3Rows = [
    ...removedThisYear,
    ...finishedThisYear.filter((r) => !removedGameUids.has(r.gameUid)),
    ...completedThisYear.filter(
      (r) => !removedGameUids.has(r.gameUid) && !finishedGameUids.has(r.gameUid)
    ),
    ...addedThisYear.filter((r) => !isInYear(r.receivedDate, year)),
  ];
  const group3Unique = Array.from(
    new Map(group3Rows.map((r) => [r.gameUid, r])).values()
  );
  const group3GameUids = new Set(group3Unique.map((r) => r.gameUid));
  const group4Rows = receivedThisYear.filter((r) => !group3GameUids.has(r.gameUid));

  const byPlatform = new Map<
    string,
    { added: number; forFree: number; removed: number; received: number; finished: number; completed: number }
  >();

  /** Increment a platform bucket once per gameUid (first matching row wins for platform attribution). */
  const forEachUniqueGame = (
    candidates: BacklogCompletionGameOverviewDto[],
    apply: (
      rec: { added: number; forFree: number; removed: number; received: number; finished: number; completed: number },
      row: BacklogCompletionGameOverviewDto
    ) => void
  ) => {
    const seen = new Set<string>();
    for (const r of candidates) {
      if (seen.has(r.gameUid)) continue;
      seen.add(r.gameUid);
      const key = r.platform ?? '(unknown)';
      if (!byPlatform.has(key)) {
        byPlatform.set(key, {
          added: 0,
          forFree: 0,
          removed: 0,
          received: 0,
          finished: 0,
          completed: 0,
        });
      }
      apply(byPlatform.get(key)!, r);
    }
  };

  forEachUniqueGame(
    rows.filter((r) => isInYear(r.addedToBacklog, year)),
    (rec) => {
      rec.added += 1;
    }
  );
  forEachUniqueGame(
    rows.filter((r) => isInYear(r.receivedDate, year) && r.forFree),
    (rec) => {
      rec.forFree += 1;
    }
  );
  forEachUniqueGame(
    rows.filter((r) => isInYear(r.removedFromBacklog, year)),
    (rec) => {
      rec.removed += 1;
    }
  );
  forEachUniqueGame(
    rows.filter((r) => isInYear(r.receivedDate, year)),
    (rec) => {
      rec.received += 1;
    }
  );
  forEachUniqueGame(
    rows.filter((r) => isInYear(r.finishedDate, year)),
    (rec) => {
      rec.finished += 1;
    }
  );
  forEachUniqueGame(
    rows.filter((r) => isInYear(r.completedDate, year)),
    (rec) => {
      rec.completed += 1;
    }
  );
  const byPlatformSorted = [...byPlatform.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  );
  const platformSum = byPlatformSorted.reduce(
    (acc, [, rec]) => ({
      added: acc.added + rec.added,
      forFree: acc.forFree + rec.forFree,
      removed: acc.removed + rec.removed,
      received: acc.received + rec.received,
      finished: acc.finished + rec.finished,
      completed: acc.completed + rec.completed,
    }),
    { added: 0, forFree: 0, removed: 0, received: 0, finished: 0, completed: 0 }
  );

  const thumbSx = { width: 20, height: 28, flexShrink: 0, borderRadius: 0.5 };

  return (
    <Stack spacing={2}>
      <Typography variant="h4" sx={{ textAlign: 'center' }}>
        Backlog Completion Overview
      </Typography>

      <YearlyReviewYearSelector
        years={YEARS}
        selectedYear={year}
        onYearChange={setYear}
      />

      <Accordion defaultExpanded={false} sx={{ ...solidSegmentSx, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">
            Games played in {year} ({gamesPlayedPerYear.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Game</TableCell>
                <TableCell align="right">Bookings</TableCell>
                <TableCell align="right">Playthroughs</TableCell>
                <TableCell align="right">Playtime</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gamesPlayedPerYear.map((r) => (
                <TableRow
                  key={r.gameInstanceUid}
                  component={Link}
                  to={gameInstanceTo(r.gameInstanceUid, instanceReturn)}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SmartImage
                        imageUid={r.coverImageUid}
                        alt=""
                        thumbnail
                        compactPlaceholder
                        sx={thumbSx}
                      />
                      <span>{r.gameName}</span>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{r.bookingCount}</TableCell>
                  <TableCell align="right">{r.playthroughCount}</TableCell>
                  <TableCell align="right">
                    {formatPlaytimeHours(r.totalPlaytimeSeconds)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {gamesPlayedPerYear.length === 0 && !loading && (
            <Typography color="text.secondary" variant="body2">
              No games played in this year.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Group 1: Backlog breakdown + bonus */}
          <Card variant="outlined" sx={solidSegmentSx}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Backlog changes this year
              </Typography>
              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                <MetricStat
                  label="Games in Backlog"
                  value={gamesInBacklogCount ?? '–'}
                  color={
                    gamesInBacklogCount != null && gamesInBacklogCount > 30
                      ? 'error.main'
                      : 'success.main'
                  }
                  tooltip={'Good: below ~30\nBad: more than that'}
                />
                <MetricStat
                  label="New"
                  value={newCount}
                  color={newCount === 0 ? 'success.main' : 'error.main'}
                  tooltip={'Should only get smaller so...\nGood: 0\nBad: more than that'}
                />
                <MetricStat
                  label="Paid"
                  value={paidNewCount}
                />
                <MetricStat
                  label={`Removed from ${String(year)}`}
                  value={removedFrom2026Count}
                  color={removedFrom2026Count > 0 ? 'success.main' : 'error.main'}
                  tooltip={'Good: more than 0\nBad: 0'}
                />
                <MetricStat
                  label="Removed from Past"
                  value={removedFromPastCount}
                  color={removedFromPastCount > 0 ? 'success.main' : 'error.main'}
                  tooltip={'Good: more than 0\nBad: 0'}
                />
                <MetricStat
                  label={`Finished games ${String(year)}`}
                  value={finishedCount}
                  color={finishedCount > 0 ? 'success.main' : 'error.main'}
                />
                <MetricStat
                  label={`Completed games ${String(year)}`}
                  value={completedCount}
                  color={completedCount > 0 ? 'success.main' : 'error.main'}
                />
                <MetricStat
                  label="Removed without finishing/completing"
                  value={removedWithoutFinishOrCompleteCount}
                />
              </Stack>
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                  <MetricStat
                    label="Remaining new backlog additions"
                    value={conclusion}
                    color={conclusion > 0 ? 'error.main' : 'success.main'}
                    tooltip={
                      'Good: 0 or less (cleared at least as many as were added)\nBad: more than 0 (backlog still grew)'
                    }
                  />
                  <MetricStat
                    label="Score for finished games"
                    value={finishedConclusion}
                    color={finishedConclusion < 0 ? 'error.main' : 'success.main'}
                    tooltip={
                      'Finished Games +/- Backlog Add/Remove Breakdown (+ if more gomes removed, - if more added).\nGood: 0 or higher\nBad: below 0'
                    }
                  />
                  <MetricStat
                    label="Score for completed games"
                    value={completionTotal}
                    color={completionTotal < 0 ? 'error.main' : 'success.main'}
                    tooltip={
                      'Completed Games +/- Backlog Add/Remove Breakdown (+ if more gomes removed, - if more added).\nGood: 0 or higher\nBad: below 0'
                    }
                  />
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* Group 2: By console/platform */}
          <Card variant="outlined" sx={solidSegmentSx}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Sum of games by platform
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell component="th" scope="row">Sum</TableCell>
                    <TableCell align="right">{platformSum.added}</TableCell>
                    <TableCell align="right">{platformSum.forFree}</TableCell>
                    <TableCell align="right">{platformSum.removed}</TableCell>
                    <TableCell align="right">{platformSum.received}</TableCell>
                    <TableCell align="right">{platformSum.finished}</TableCell>
                    <TableCell align="right">{platformSum.completed}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Platform</TableCell>
                    <TableCell align="right">Added this year</TableCell>
                    <TableCell align="right">Received for free</TableCell>
                    <TableCell align="right">Removed this year</TableCell>
                    <TableCell align="right">Received this year</TableCell>
                    <TableCell align="right">Finished this year</TableCell>
                    <TableCell align="right">Completed this year</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {byPlatformSorted.map(([platform, rec]) => (
                    <TableRow key={platform}>
                      <TableCell>{platform}</TableCell>
                      <TableCell align="right">{rec.added}</TableCell>
                      <TableCell align="right">{rec.forFree}</TableCell>
                      <TableCell align="right">{rec.removed}</TableCell>
                      <TableCell align="right">{rec.received}</TableCell>
                      <TableCell align="right">{rec.finished}</TableCell>
                      <TableCell align="right">{rec.completed}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Group 3: Removed / finished / completed this year + added to backlog (not received) this year */}
          <Card variant="outlined" sx={solidSegmentSx}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Removed / finished / completed this year (and games added to backlog but not received this year)
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Game</TableCell>
                    <TableCell>Platform</TableCell>
                    <TableCell>Received</TableCell>
                    <TableCell>Added to backlog</TableCell>
                    <TableCell>Removed</TableCell>
                    <TableCell>Finished</TableCell>
                    <TableCell>100%</TableCell>
                    <TableCell>For free</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group3Unique.map((r) => (
                    <TableRow
                      key={r.gameUid}
                      component={Link}
                      to={gameInstanceTo(r.gameInstanceUid, instanceReturn)}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <SmartImage
                            imageUid={r.coverImageUid}
                            alt=""
                            thumbnail
                            compactPlaceholder
                            sx={thumbSx}
                          />
                          <span>{r.gameName}</span>
                        </Stack>
                      </TableCell>
                      <TableCell>{r.platform}</TableCell>
                      <TableCell>{r.receivedDate ?? '–'}</TableCell>
                      <TableCell>{r.addedToBacklog ?? '–'}</TableCell>
                      <TableCell>{r.removedFromBacklog ?? '–'}</TableCell>
                      <TableCell>{r.finishedDate ?? '–'}</TableCell>
                      <TableCell>{r.completedDate ?? '–'}</TableCell>
                      <TableCell>{r.forFree ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {group3Unique.length === 0 && (
                <Typography color="text.secondary">No entries.</Typography>
              )}
            </CardContent>
          </Card>

          {/* Group 4: Received this year, not in group 3 */}
          <Card variant="outlined" sx={solidSegmentSx}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Received this year (not in list above)
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Game</TableCell>
                    <TableCell>Platform</TableCell>
                    <TableCell>Received</TableCell>
                    <TableCell>Added to backlog</TableCell>
                    <TableCell>Removed</TableCell>
                    <TableCell>Finished</TableCell>
                    <TableCell>100%</TableCell>
                    <TableCell>For free</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group4Rows.map((r) => (
                    <TableRow
                      key={r.gameUid}
                      component={Link}
                      to={gameInstanceTo(r.gameInstanceUid, instanceReturn)}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <SmartImage
                            imageUid={r.coverImageUid}
                            alt=""
                            thumbnail
                            compactPlaceholder
                            sx={thumbSx}
                          />
                          <span>{r.gameName}</span>
                        </Stack>
                      </TableCell>
                      <TableCell>{r.platform}</TableCell>
                      <TableCell>{r.receivedDate ?? '–'}</TableCell>
                      <TableCell>{r.addedToBacklog ?? '–'}</TableCell>
                      <TableCell>{r.removedFromBacklog ?? '–'}</TableCell>
                      <TableCell>{r.finishedDate ?? '–'}</TableCell>
                      <TableCell>{r.completedDate ?? '–'}</TableCell>
                      <TableCell>{r.forFree ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {group4Rows.length === 0 && (
                <Typography color="text.secondary">No entries.</Typography>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );
}
