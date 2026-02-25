import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchBacklogCompletionGameOverview, fetchGamePlayedPerYear } from '../../services/statisticsApi';
import type {
  BacklogCompletionGameOverviewDto,
  GamePlayedPerYearDto,
} from '../../services/statisticsApi';
import SmartImage from '../shared/SmartImage';

const MIN_YEAR = 2017;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from(
  { length: CURRENT_YEAR - MIN_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i
);

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

export default function BacklogCompletionOverviewPage() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [rows, setRows] = useState<BacklogCompletionGameOverviewDto[]>([]);
  const [gamesPlayedPerYear, setGamesPlayedPerYear] = useState<GamePlayedPerYearDto[]>([]);
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
    load();
  }, [load]);

  const addedThisYear = rows.filter((r) => isInYear(r.addedToBacklog, year));
  const removedThisYear = rows.filter((r) => isInYear(r.removedFromBacklog, year));
  const removedFromSameYear = removedThisYear.filter((r) =>
    isInYear(r.addedToBacklog, year)
  );
  const removedFromPast = removedThisYear.filter(
    (r) => !isInYear(r.addedToBacklog, year)
  );
  const newCount = addedThisYear.length;
  const forFreeNewCount = addedThisYear.filter((r) => r.forFree).length;
  const paidNewCount = newCount - forFreeNewCount;
  const removedFrom2026Count = removedFromSameYear.length;
  const removedFromPastCount = removedFromPast.length;
  const conclusion = newCount - (removedFrom2026Count + removedFromPastCount);
  const finishedThisYear = rows.filter((r) => isInYear(r.finishedDate, year));
  const completedThisYear = rows.filter((r) => isInYear(r.completedDate, year));
  const finishedCount = finishedThisYear.length;
  const completedCount = completedThisYear.length;
  const finishedConclusion =
    (conclusion > 0 ? -conclusion : conclusion) + finishedCount;
  const completionTotal =
    (conclusion > 0 ? -conclusion : conclusion) + finishedCount + completedCount;

  const receivedThisYear = rows.filter((r) => isInYear(r.receivedDate, year));
  const group3Rows = [
    ...removedThisYear,
    ...finishedThisYear.filter(
      (r) => !removedThisYear.some((x) => x.gameInstanceUid === r.gameInstanceUid)
    ),
    ...completedThisYear.filter(
      (r) =>
        !removedThisYear.some((x) => x.gameInstanceUid === r.gameInstanceUid) &&
        !finishedThisYear.some((x) => x.gameInstanceUid === r.gameInstanceUid)
    ),
    ...addedThisYear.filter(
      (r) => !isInYear(r.receivedDate, year)
    ),
  ];
  const group3Unique = Array.from(
    new Map(group3Rows.map((r) => [r.gameInstanceUid, r])).values()
  );
  const group3Uids = new Set(group3Unique.map((r) => r.gameInstanceUid));
  const group4Rows = receivedThisYear.filter(
    (r) => !group3Uids.has(r.gameInstanceUid)
  );

  const byPlatform = new Map<
    string,
    { added: number; forFree: number; removed: number; received: number; finished: number; completed: number }
  >();
  for (const r of rows) {
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
    const rec = byPlatform.get(key)!;
    if (isInYear(r.addedToBacklog, year)) {
      rec.added += 1;
      if (r.forFree) rec.forFree += 1;
    }
    if (isInYear(r.removedFromBacklog, year)) rec.removed += 1;
    if (isInYear(r.receivedDate, year)) rec.received += 1;
    if (isInYear(r.finishedDate, year)) rec.finished += 1;
    if (isInYear(r.completedDate, year)) rec.completed += 1;
  }
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
      <Stack direction="row" alignItems="center" gap={2}>
        <Typography variant="h5">Backlog & Completion Overview</Typography>
        <Button
          component={Link}
          to="/backlog"
          variant="outlined"
          size="small"
        >
          Back to Backlog
        </Button>
      </Stack>

      <FormControl size="small" sx={{ minWidth: 120, maxWidth: 160, alignSelf: 'flex-start' }}>
        <InputLabel>Year</InputLabel>
        <Select
          label="Year"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {YEARS.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Accordion defaultExpanded={false} sx={{ '&:before': { display: 'none' } }}>
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
                  to={`/game-instances/${r.gameInstanceUid}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {r.coverImageUid && (
                        <SmartImage
                          imageUid={r.coverImageUid}
                          alt=""
                          thumbnail
                          sx={thumbSx}
                        />
                      )}
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
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Backlog
              </Typography>
              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    New
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      color: newCount === 0 ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {newCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Paid
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      color: paidNewCount === 0 ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {paidNewCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Removed from {String(year)}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      color: removedFrom2026Count > 0 ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {removedFrom2026Count}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Removed from Past
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      color: removedFromPastCount > 0 ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {removedFromPastCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Finished games
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      color: finishedCount > 0 ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {finishedCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Complete games
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      color: completedCount > 0 ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {completedCount}
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Remaining new backlog additions
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        color: conclusion > 0 ? 'error.main' : 'success.main',
                        fontWeight: 'bold',
                      }}
                    >
                      {conclusion}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Score for finished games
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        color: finishedConclusion < 0 ? 'error.main' : 'success.main',
                        fontWeight: 'bold',
                      }}
                    >
                      {finishedConclusion}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Score for completed games
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        color: completionTotal < 0 ? 'error.main' : 'success.main',
                        fontWeight: 'bold',
                      }}
                    >
                      {completionTotal}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* Group 2: By console/platform */}
          <Card variant="outlined">
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
                    <TableCell align="right">For free</TableCell>
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
          <Card variant="outlined">
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
                      key={r.gameInstanceUid}
                      component={Link}
                      to={`/game-instances/${r.gameInstanceUid}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {r.coverImageUid && (
                            <SmartImage
                              imageUid={r.coverImageUid}
                              alt=""
                              thumbnail
                              sx={thumbSx}
                            />
                          )}
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
          <Card variant="outlined">
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
                      key={r.gameInstanceUid}
                      component={Link}
                      to={`/game-instances/${r.gameInstanceUid}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {r.coverImageUid && (
                            <SmartImage
                              imageUid={r.coverImageUid}
                              alt=""
                              thumbnail
                              sx={thumbSx}
                            />
                          )}
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
