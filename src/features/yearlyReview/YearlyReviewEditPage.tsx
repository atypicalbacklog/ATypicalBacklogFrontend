import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getImageUrl } from '../../services/imageApi';
import { ImageApi } from '../../services/imageApi';
import { queryGameOverview } from '../../services/gameOverviewApi';
import type { GameOverviewQueryPayload } from '../../services/gameOverviewApi';
import {
  YearlyReviewApi,
  type YearlyReviewDto,
  type YearlyReviewGameDto,
  type UpsertYearlyReviewGameRequest,
} from '../../services/yearlyReviewApi';
import type { GameOverviewRowDto } from '../library/types';
import YearlyReviewGameCard from './YearlyReviewGameCard';
import SmartImage from '../shared/SmartImage';

const CURRENT_YEAR = new Date().getFullYear();
const LAST_YEAR = CURRENT_YEAR - 1;
const MIN_YEAR = 2017;
const YEARS = Array.from({ length: LAST_YEAR - MIN_YEAR + 1 }, (_, i) => LAST_YEAR - i);

/** Chunk games into rows with max 6 per row, balanced (e.g. 13 -> 5, 4, 4). */
function chunkGames<T>(items: T[], maxPerRow: number = 6): T[][] {
  if (items.length === 0) return [];
  const numRows = Math.ceil(items.length / maxPerRow);
  const rows: T[][] = [];
  let remaining = items.length;
  for (let i = 0; i < numRows; i++) {
    const take = Math.ceil(remaining / (numRows - i));
    rows.push(items.slice(rows.flat().length, rows.flat().length + take));
    remaining -= take;
  }
  return rows;
}

function displayName(row: GameOverviewRowDto): string {
  return row.instanceName ?? row.gameName ?? '';
}

function displayCoverUid(row: GameOverviewRowDto): string | null {
  if (row.isDlc) return row.dlcCoverImageUid ?? row.instanceCoverImageUid ?? row.gameCoverImageUid ?? row.coverImageUid;
  return row.instanceCoverImageUid ?? row.gameCoverImageUid ?? row.coverImageUid;
}

export default function YearlyReviewEditPage() {
  const [year, setYear] = useState(LAST_YEAR);
  const [data, setData] = useState<YearlyReviewDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [introText, setIntroText] = useState('');
  const [outroText, setOutroText] = useState('');
  const [textSaving, setTextSaving] = useState(false);

  const [categoryEditIdx, setCategoryEditIdx] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);

  const [gameDialogOpen, setGameDialogOpen] = useState(false);
  const [gameEditTarget, setGameEditTarget] = useState<{ categoryUid: string; game?: YearlyReviewGameDto } | null>(null);
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [gameSearchResults, setGameSearchResults] = useState<GameOverviewRowDto[]>([]);
  const [gameSearching, setGameSearching] = useState(false);
  const [selectedRow, setSelectedRow] = useState<GameOverviewRowDto | null>(null);
  const [gameText, setGameText] = useState('');
  const [preferredImageUid, setPreferredImageUid] = useState<string | null>(null);
  const [gameImages, setGameImages] = useState<{ uid: string }[]>([]);
  const [gameSaving, setGameSaving] = useState(false);

  const [dragState, setDragState] = useState<{ categoryUid: string; gameUid: string } | null>(null);
  const [dragOver, setDragOver] = useState<{ categoryUid: string; insertIndex: number } | null>(null);
  const [reorderSaving, setReorderSaving] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const loadReview = useCallback(() => {
    setLoading(true);
    setError(null);
    YearlyReviewApi.getByYear(year)
      .then((d) => {
        setData(d);
        setIntroText(d?.introText ?? '');
        setOutroText(d?.outroText ?? '');
      })
      .catch(() => setError('Failed to load yearly review'))
      .finally(() => setLoading(false));
  }, [year]);

  const handleUpdateText = useCallback(async () => {
    if (!data?.uid) return;
    setTextSaving(true);
    setError(null);
    try {
      await YearlyReviewApi.update(data.uid, {
        introText: introText || null,
        outroText: outroText || null,
      });
    } catch {
      setError('Failed to update text.');
    } finally {
      setTextSaving(false);
    }
  }, [data?.uid, introText, outroText]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  useEffect(() => {
    if (!gameSearchQuery.trim() || gameSearchQuery.length < 2) {
      setGameSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      setGameSearching(true);
      const payload: GameOverviewQueryPayload = {
        searchText: gameSearchQuery || null,
        platformUids: null,
        consoleUids: null,
        inBacklog: null,
        hasActivePlaythrough: null,
        completionStateUids: null,
        playthroughTypeUids: null,
        includeDlc: false,
        onlyGamesWithDlc: null,
        sortMode: 'NAME_ASC',
      };
      queryGameOverview(payload)
        .then((rows) => setGameSearchResults(rows.filter((r) => !r.isDlc)))
        .catch(() => setGameSearchResults([]))
        .finally(() => setGameSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [gameSearchQuery]);

  useEffect(() => {
    if (!selectedRow?.gameUid) {
      setGameImages([]);
      return;
    }
    ImageApi.listByGame(selectedRow.gameUid)
      .then((list) => setGameImages(list.map((im) => ({ uid: im.uid }))))
      .catch(() => setGameImages([]));
  }, [selectedRow?.gameUid]);

  const openCategoryEdit = (idx: number) => {
    const sorted = data?.categories ? [...data.categories].sort((a, b) => a.order - b.order) : [];
    const cat = sorted[idx];
    if (cat) {
      setCategoryEditIdx(idx);
      setCategoryName(cat.name);
    }
  };

  const saveCategory = async () => {
    if (!data || categoryEditIdx == null) return;
    const sorted = [...data.categories].sort((a, b) => a.order - b.order);
    const cat = sorted[categoryEditIdx];
    if (!cat) return;
    setCategorySaving(true);
    try {
      await YearlyReviewApi.upsertCategory({
        uid: cat.uid,
        yearlyReviewUid: data.uid,
        name: categoryName.trim(),
        order: cat.order,
      });
      setCategoryEditIdx(null);
      loadReview();
    } catch {
      setError('Failed to save category');
    } finally {
      setCategorySaving(false);
    }
  };

  const addCategoryAtOrder = async (newOrder: number) => {
    if (!data) return;
    setCategorySaving(true);
    try {
      const sorted = [...data.categories].sort((a, b) => a.order - b.order);
      for (const cat of sorted) {
        if (cat.order >= newOrder) {
          await YearlyReviewApi.upsertCategory({
            uid: cat.uid,
            yearlyReviewUid: data.uid,
            name: cat.name,
            order: cat.order + 1,
          });
        }
      }
      await YearlyReviewApi.upsertCategory({
        uid: null,
        yearlyReviewUid: data.uid,
        name: 'New category',
        order: newOrder,
      });
      loadReview();
    } catch {
      setError('Failed to add category');
    } finally {
      setCategorySaving(false);
    }
  };

  const removeCategory = async (categoryUid: string) => {
    const sorted = data?.categories ? [...data.categories].sort((a, b) => a.order - b.order) : [];
    const removed = sorted.find((c) => c.uid === categoryUid);
    const removedOrder = removed?.order ?? -1;
    try {
      await YearlyReviewApi.invalidateCategory(categoryUid);
      const newData = await YearlyReviewApi.getByYear(year);
      setData(newData);
      const reordered = [...newData.categories].sort((a, b) => a.order - b.order);
      for (const cat of reordered) {
        if (cat.order > removedOrder) {
          await YearlyReviewApi.upsertCategory({
            uid: cat.uid,
            yearlyReviewUid: newData.uid,
            name: cat.name,
            order: cat.order - 1,
          });
        }
      }
      const updated = await YearlyReviewApi.getByYear(year);
      setData(updated);
    } catch {
      setError('Failed to remove category');
    }
  };

  const openAddGame = (categoryUid: string) => {
    setGameEditTarget({ categoryUid });
    setSelectedRow(null);
    setGameText('');
    setPreferredImageUid(null);
    setGameSearchQuery('');
    setGameSearchResults([]);
    setGameDialogOpen(true);
  };

  const openEditGame = (categoryUid: string, game: YearlyReviewGameDto) => {
    setGameEditTarget({ categoryUid, game });
    setGameText(game.text ?? '');
    setPreferredImageUid(game.preferredImageUid);
    setGameSearchQuery('');
    setGameSearchResults([]);
    if (game.gameUid) {
      setSelectedRow({
        gameUid: game.gameUid,
        gameInstanceUid: game.gameInstanceUid ?? null,
        gameName: '',
        instanceName: '',
        coverImageUid: game.preferredImageUid,
        inBacklog: false,
        hasActivePlaythrough: false,
        completionStateUid: null,
        totalPlaytimeSeconds: 0,
      } as GameOverviewRowDto);
    } else {
      setSelectedRow(null);
    }
    setGameDialogOpen(true);
  };

  const saveGame = async () => {
    if (!data || !gameEditTarget) return;
    const category = data.categories.find((c) => c.uid === gameEditTarget.categoryUid);
    if (!category) return;
    if (!selectedRow) {
      setError('Select a game/instance');
      return;
    }
    setGameSaving(true);
    try {
      const order = gameEditTarget.game != null ? gameEditTarget.game.order : category.games.length;
      const payload: UpsertYearlyReviewGameRequest = {
        uid: gameEditTarget.game?.uid ?? null,
        categoryUid: gameEditTarget.categoryUid,
        gameUid: selectedRow.gameUid,
        gameInstanceUid: selectedRow.gameInstanceUid ?? null,
        preferredImageUid,
        text: gameText.trim() || null,
        order,
      };
      await YearlyReviewApi.upsertGame(payload);
      setGameDialogOpen(false);
      setGameEditTarget(null);
      loadReview();
    } catch {
      setError('Failed to save game');
    } finally {
      setGameSaving(false);
    }
  };

  const removeGame = async (gameUid: string) => {
    try {
      await YearlyReviewApi.invalidateGame(gameUid);
      loadReview();
    } catch {
      setError('Failed to remove game');
    }
  };

  const persistReorder = async (categoryUid: string, games: YearlyReviewGameDto[]) => {
    if (!data) return;
    setReorderSaving(true);
    setError(null);
    try {
      for (let i = 0; i < games.length; i++) {
        const g = games[i];
        const payload: UpsertYearlyReviewGameRequest = {
          uid: g.uid,
          categoryUid,
          gameUid: g.gameUid,
          gameInstanceUid: g.gameInstanceUid ?? null,
          preferredImageUid: g.preferredImageUid ?? null,
          text: g.text ?? null,
          order: i,
        };
        // Persist sequentially to keep server-side order deterministic.
        // (Endpoint is single-upsert; no bulk reorder contract.)
        // eslint-disable-next-line no-await-in-loop
        await YearlyReviewApi.upsertGame(payload);
      }
      await YearlyReviewApi.getByYear(year).then(setData);
    } catch {
      setError('Failed to reorder games');
    } finally {
      setReorderSaving(false);
      setDragState(null);
      setDragOver(null);
    }
  };

  const categories = data?.categories ?? [];
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
        <Typography variant="h4">Yearly review (edit)</Typography>
        <Button component={Link} to="/reviews/yearly" variant="outlined" size="small">
          Back to view
        </Button>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            label="Year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {YEARS.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {data?.uid && (
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Intro text</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="Intro text"
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                multiline
                minRows={3}
                size="small"
                fullWidth
              />
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Outro text</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="Outro text"
                value={outroText}
                onChange={(e) => setOutroText(e.target.value)}
                multiline
                minRows={3}
                size="small"
                fullWidth
              />
            </AccordionDetails>
          </Accordion>
          <Button
            variant="contained"
            size="small"
            onClick={handleUpdateText}
            disabled={textSaving}
          >
            {textSaving ? 'Updating…' : 'Update text'}
          </Button>
        </Stack>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && <CircularProgress />}

      {!loading && data && (
        <Stack spacing={4}>
          {sortedCategories.map((category, catIdx) => (
            <Box key={category.uid}>
              {catIdx === 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => addCategoryAtOrder(category.order)}
                  disabled={categorySaving}
                  sx={{ mb: 1 }}
                >
                  Add category
                </Button>
              )}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                {categoryEditIdx === catIdx ? (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TextField
                      size="small"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      label="Category name"
                      sx={{ minWidth: 200 }}
                    />
                    <Button size="small" onClick={saveCategory} disabled={categorySaving}>
                      Save
                    </Button>
                    <Button size="small" onClick={() => setCategoryEditIdx(null)}>
                      Cancel
                    </Button>
                  </Stack>
                ) : (
                  <>
                    <Typography variant="h6">{category.name}</Typography>
                    <IconButton size="small" onClick={() => openCategoryEdit(catIdx)} aria-label="Edit category">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => removeCategory(category.uid)} aria-label="Remove category">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Stack>

              <Stack spacing={2}>
                {(() => {
                  const gamesSorted = [...category.games].sort((a, b) => a.order - b.order);
                  const rows = chunkGames(gamesSorted, 6);
                  let globalIdx = 0;

                  const isActiveCategory = dragState?.categoryUid === category.uid;
                  const activeInsertIndex =
                    dragOver?.categoryUid === category.uid ? dragOver.insertIndex : null;

                  const handleDrop = async (insertIndex: number) => {
                    if (!dragState || dragState.categoryUid !== category.uid) return;
                    if (reorderSaving) return;

                    const fromIndex = gamesSorted.findIndex((g) => g.uid === dragState.gameUid);
                    if (fromIndex < 0) return;

                    let toIndex = insertIndex;
                    if (toIndex > fromIndex) toIndex -= 1;
                    toIndex = Math.max(0, Math.min(gamesSorted.length, toIndex));
                    if (toIndex === fromIndex) return;

                    const next = [...gamesSorted];
                    const [moved] = next.splice(fromIndex, 1);
                    next.splice(toIndex, 0, moved);

                    await persistReorder(category.uid, next);
                  };

                  const addGameButton = (
                    <IconButton
                      onClick={() => openAddGame(category.uid)}
                      aria-label="Add game"
                      sx={{
                        flexShrink: 0,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': { bgcolor: 'primary.dark' },
                        alignSelf: 'flex-start',
                        minWidth: 40,
                        minHeight: 40,
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  );

                  return (
                    <Box
                      onDragOver={(e) => {
                        if (!isActiveCategory || reorderSaving) return;
                        e.preventDefault();
                        setDragOver({ categoryUid: category.uid, insertIndex: gamesSorted.length });
                      }}
                      onDrop={(e) => {
                        if (!isActiveCategory || reorderSaving) return;
                        e.preventDefault();
                        void handleDrop(activeInsertIndex ?? gamesSorted.length);
                      }}
                      sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}
                    >
                      {gamesSorted.length === 0 ? (
                        <Stack direction="row" alignItems="flex-start">
                          {addGameButton}
                        </Stack>
                      ) : (
                        rows.map((row, rowIdx) => (
                        <Stack
                          key={rowIdx}
                          direction="row"
                          spacing={isMobile ? 1 : 2}
                          flexWrap="wrap"
                          alignItems="flex-start"
                        >
                          {row.map((game) => {
                            const idx = globalIdx++;
                            const showBefore = isActiveCategory && activeInsertIndex === idx;
                            const showAfter =
                              isActiveCategory &&
                              activeInsertIndex === gamesSorted.length &&
                              idx === gamesSorted.length - 1;

                            return (
                              <Box
                                key={game.uid}
                                onDragOver={(e) => {
                                  if (!isActiveCategory || reorderSaving) return;
                                  e.stopPropagation();
                                  e.preventDefault();
                                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                  const before = e.clientX < rect.left + rect.width / 2;
                                  setDragOver({
                                    categoryUid: category.uid,
                                    insertIndex: before ? idx : idx + 1,
                                  });
                                }}
                                onDrop={(e) => {
                                  if (!isActiveCategory || reorderSaving) return;
                                  e.stopPropagation();
                                  e.preventDefault();
                                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                  const before = e.clientX < rect.left + rect.width / 2;
                                  void handleDrop(before ? idx : idx + 1);
                                }}
                                sx={{
                                  position: 'relative',
                                  '&::before': showBefore
                                    ? {
                                        content: '""',
                                        position: 'absolute',
                                        left: -6,
                                        top: 0,
                                        bottom: 0,
                                        width: 4,
                                        bgcolor: 'primary.main',
                                        borderRadius: 2,
                                      }
                                    : undefined,
                                  '&::after': showAfter
                                    ? {
                                        content: '""',
                                        position: 'absolute',
                                        right: -6,
                                        top: 0,
                                        bottom: 0,
                                        width: 4,
                                        bgcolor: 'primary.main',
                                        borderRadius: 2,
                                      }
                                    : undefined,
                                  opacity:
                                    reorderSaving && dragState?.gameUid === game.uid ? 0.6 : 1,
                                }}
                              >
                                <YearlyReviewGameCard
                                  game={game}
                                  onEdit={() => openEditGame(category.uid, game)}
                                  compact={isMobile}
                                />

                                {/* Drag handle (top-left) */}
                                <IconButton
                                  size="small"
                                  draggable
                                  onDragStart={(e) => {
                                    e.stopPropagation();
                                    e.dataTransfer.effectAllowed = 'move';
                                    e.dataTransfer.setData('text/plain', game.uid);
                                    setDragState({ categoryUid: category.uid, gameUid: game.uid });
                                    setDragOver({ categoryUid: category.uid, insertIndex: idx });
                                  }}
                                  onDragEnd={() => {
                                    setDragState(null);
                                    setDragOver(null);
                                  }}
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    left: 4,
                                    bgcolor: (theme) =>
                                      theme.palette.mode === 'dark'
                                        ? theme.palette.grey[900]
                                        : theme.palette.common.white,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    boxShadow: 1,
                                    cursor: 'grab',
                                    '&:active': { cursor: 'grabbing' },
                                  }}
                                  aria-label="Drag to reorder"
                                >
                                  <DragIndicatorIcon fontSize="small" />
                                </IconButton>

                                {/* Delete (top-right) */}
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    bgcolor: (theme) =>
                                      theme.palette.mode === 'dark'
                                        ? theme.palette.grey[900]
                                        : theme.palette.common.white,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    boxShadow: 1,
                                  }}
                                  onClick={() => removeGame(game.uid)}
                                  aria-label="Remove game"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            );
                          })}
                          {rowIdx === rows.length - 1 && addGameButton}
                        </Stack>
                      ))
                      )}
                    </Box>
                  );
                })()}
              </Stack>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => addCategoryAtOrder(category.order + 1)}
                disabled={categorySaving}
                sx={{ mt: 1 }}
              >
                Add category
              </Button>
            </Box>
          ))}

          {sortedCategories.length === 0 && (
            <Stack spacing={1}>
              <Typography color="text.secondary">No categories yet.</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => addCategoryAtOrder(0)}
                disabled={categorySaving}
              >
                Add category
              </Button>
            </Stack>
          )}
        </Stack>
      )}

      {/* Game add/edit dialog */}
      <Dialog open={gameDialogOpen} onClose={() => setGameDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{gameEditTarget?.game ? 'Edit game' : 'Add game'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Search game / instance"
              value={gameSearchQuery}
              onChange={(e) => setGameSearchQuery(e.target.value)}
              size="small"
              fullWidth
              placeholder="Type to search (no DLCs)"
            />
            {gameSearching && <CircularProgress size={24} />}
            {gameSearchResults.length > 0 && (
              <Box sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                {gameSearchResults.map((r) => (
                  <Box
                    key={r.gameInstanceUid ?? r.gameUid}
                    onClick={() => setSelectedRow(r)}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      bgcolor: selectedRow?.gameInstanceUid === r.gameInstanceUid ? 'action.selected' : undefined,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    {displayCoverUid(r) && (
                      <SmartImage
                        imageUid={displayCoverUid(r)}
                        thumbnail
                        alt=""
                        aspectRatio={2 / 3}
                        fit="contain"
                        sx={{ width: 40, height: 56, borderRadius: 0.5 }}
                        imgSx={{ borderRadius: 0.5 }}
                      />
                    )}
                    <Typography variant="body2">{displayName(r)}</Typography>
                  </Box>
                ))}
              </Box>
            )}
            {selectedRow && gameImages.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">Preferred image (optional)</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                  {gameImages.map((im) => (
                    <Box
                      key={im.uid}
                      onClick={() => setPreferredImageUid(preferredImageUid === im.uid ? null : im.uid)}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        border: 2,
                        borderColor: preferredImageUid === im.uid ? 'primary.main' : 'divider',
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                    >
                      <SmartImage
                        imageUid={im.uid}
                        thumbnail
                        alt=""
                        aspectRatio={1}
                        fit="contain"
                        sx={{ width: '100%', height: '100%' }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            <TextField
              label="Text"
              value={gameText}
              onChange={(e) => setGameText(e.target.value)}
              multiline
              minRows={3}
              size="small"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGameDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveGame} disabled={gameSaving || !selectedRow}>
            {gameSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
