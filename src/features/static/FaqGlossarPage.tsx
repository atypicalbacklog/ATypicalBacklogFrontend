import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Link as MuiLink, Paper, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect } from 'react';
import { BLUESKY_PROFILE_URL, GITHUB_PROFILE_URL } from '../shared/socialLinks';
import { glossaryAnchorScrollSx, scheduleGlossaryAnchorScroll, scrollToGlossaryAnchor } from './glossaryAnchor';
import { useLocation } from 'react-router-dom';
import TrackingCoverageBar from '../shared/TrackingCoverageBar';
import { TRACKING_COVERAGE_ENTRIES } from './trackingCoverageData';

const GLOSSARY_SECTION_ID = 'glossary';
const GLOSSARY_COMPLETION_STATES_ID = 'glossary-completion-states';

function GlossarySegmentLink({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <MuiLink
      href={`#${id}`}
      underline="hover"
      onClick={(e) => {
        e.preventDefault();
        scrollToGlossaryAnchor(id);
      }}
    >
      {children}
    </MuiLink>
  );
}

export default function FaqGlossarPage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace(/^#/, '');
    scheduleGlossaryAnchorScroll(id, 'auto');
  }, [location.pathname, location.hash]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        FAQ &amp; Glossary
      </Typography>

      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <Accordion
            defaultExpanded
            disableGutters
            sx={{
              boxShadow: 'none',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
              <Typography variant="h5">What is this Website?</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Atypical Backlog is a free, non-commercial overview of my personal, private video game consumption habits, including
                  subjective reviews of that behavior.
                </Typography>

                <Box>
                  <Divider sx={{ mb: 1.5 }} />
                  <Typography variant="subtitle1" sx={{ mb: 0.75 }}>
                    Why I built this
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    To unify my video game collection overview with my time tracking and end-of-year
                    review generation in one application. I host it online to make reviews shareable
                    and to provide potential community services in the future.
                  </Typography>
                </Box>

                <Box>
                  <Divider sx={{ mb: 1.5 }} />
                  <Typography variant="subtitle1" sx={{ mb: 0.75 }}>
                    What is tracked &amp; how complete it is
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    This tracks playtime, game possession, backlog entries, and completion context per game
                    instance (including DLC where it matters). Free games and playing the same title on
                    multiple consoles/platforms can lead to duplicate-looking entries — that is intentional,
                    because each instance is tracked separately. How completion states work is described in
                    the{' '}
                    <GlossarySegmentLink id={GLOSSARY_SECTION_ID}>
                      glossary
                    </GlossarySegmentLink>
                    . Currently the following games are tracked on this site / will be added soon-ish:
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    <Stack
                      spacing={0.5}
                      sx={{
                        width: '100%',
                        maxWidth: 720,
                        mx: 'auto',
                      }}
                    >
                      {TRACKING_COVERAGE_ENTRIES.map((entry) => (
                        <Stack
                          key={entry.label}
                          direction="row"
                          alignItems="flex-start"
                          spacing={1}
                          sx={{ width: '100%', py: 0 }}
                        >
                          <Box sx={{ width: 96, flexShrink: 0, pt: 0.125 }}>
                            <TrackingCoverageBar percent={entry.percent} />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              lineHeight: 1.3,
                              overflowWrap: 'anywhere',
                              wordBreak: 'break-word',
                            }}
                          >
                            {entry.label}
                            {entry.hint ? (
                              <>
                                {' '}
                                <Box
                                  component="span"
                                  sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.6875rem',
                                    lineHeight: 1.2,
                                  }}
                                >
                                  ({entry.hint})
                                </Box>
                              </>
                            ) : null}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                </Box>

                <Box>
                  <Divider sx={{ mb: 1.5 }} />
                  <Typography variant="subtitle1" sx={{ mb: 0.75 }}>
                    What games are in the backlog?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                    Until completion of this application, games were only part of the backlog if:
                  </Typography>
                  <Box component="ol" sx={{ m: 0, pl: 2.5, mb: 1 }}>
                    <Typography component="li" variant="body2" color="text.secondary" sx={{ py: 0.75 }}>
                      I owned them / had personal access to them
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary" sx={{ py: 0.75 }}>
                      I still wanted to try / finish / complete them
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 0 }}>
                    Sometimes games are removed from the backlog if my tastes or opinions changed before
                    I even tried a game. Maybe I&apos;ll also add games to the backlog as soon as I have
                    interest now (before release even). Every few years I do a bit of &quot;house
                    cleaning&quot; and reevaluate old entries to see if I still want to play them.
                  </Typography>
                </Box>

                <Box>
                  <Divider sx={{ mb: 1.5 }} />
                  <Typography variant="subtitle1" sx={{ mb: 0.75 }}>
                    What are the reviews / review tiers?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                    I update/write the reviews at the end of a year/start of the following year. The
                    played games are distributed according to my feeling at this moment. Extreme emotions
                    during the year have time to settle and be reevaluated. This makes comparing enjoyment
                    and experiences easier and makes it more of a retrospective of a year.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                    The reviews tend to differ broadly depending on the game, and sometimes are more spoiler-heavy, sometimes only gloss over game mechanics.
                    <br />
                    They are very personal critiques and are more meant for people who played these games themselves.
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    align="center"
                    fontWeight={700}
                    paragraph
                    sx={{ my: 1.5 }}
                  >
                    Tiers and reviews are subjective and very relative.
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    align="center"
                    fontWeight={700}
                    paragraph
                    sx={{ my: 1.5 }}
                  >
                    They are not an indication of the quality of the game.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 0 }}>
                    Of course quality can influence my reviews, but I want people to make their own
                    experiences with these games — only regard these reviews as another possible viewpoint.
                  </Typography>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Other Frequently Asked Questions (FAQ)
          </Typography>
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
              '& .MuiAccordion-root': {
                boxShadow: 'none',
                '&:before': { display: 'none' },
                borderBottom: 1,
                borderColor: 'divider',
                '&:last-of-type': { borderBottom: 0 },
              },
            }}
          >
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">How accurate is game data (release dates, etc.)?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" component="div">
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                  Data is mainly referenced from{' '}
                  <MuiLink href="https://www.igdb.com" target="_blank" rel="noopener noreferrer" underline="hover">
                    IGDB.com
                  </MuiLink>{' '}
                  and{' '}
                  <MuiLink href="https://howlongtobeat.com" target="_blank" rel="noopener noreferrer" underline="hover">
                    HowLongToBeat
                  </MuiLink>
                  .
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                  Release dates sometimes differ to more accurately reflect when a game was available in my
                  region (EU, DACH).
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 0 }}>
                  When I received the game / played / completed it is sometimes rough estimates, since I have no
                  proof for older titles.
                </Typography>
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">How correct/exact is time-tracked data?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" component="div">
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                  Tracking is started/stopped <strong>manually</strong> and therefore faulty. If there are major breaks
                  during a session (15+ min), time will be reduced afterwards.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                  It also happens that I forget to start tracking and add time afterwards.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 0 }}>
                  But overall I guess there's about ~5% variance in the numbers of a given year.
                </Typography>
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">
                Do you use in-game/platform tracking (for example Steam)?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Not really, since these numbers vary wildly depending on system (sometimes replay / deaths will not
                be counted, menu/pause times are counted/not counted etc.).
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">Why is there no achievement tracking?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" component="div">
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                  Does not reflect my opinion on finishing/completing a game.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                  There are games with completion achievements where you don&apos;t need to engage with all content.
                  Or there are achievements that require way more playing, even after you have seen all meaningful content.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                  Also there are games/game systems without achievements that are tracked on this platform.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 0 }}>
                  For more on completion states, see the{' '}
                  <MuiLink
                    href={`#${GLOSSARY_SECTION_ID}`}
                    underline="hover"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToGlossaryAnchor(GLOSSARY_SECTION_ID);
                    }}
                  >
                    glossary
                  </MuiLink>
                  .
                </Typography>
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">
                How often is data updated (last time since update)?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Infrequently, currently unknown.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">
                Why didn&apos;t you just use{' '}
                <Box component="span" sx={{ fontStyle: 'italic' }}>
                  (Insert tracking platform here)
                </Box>{' '}
                instead?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" component="div">
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                  Many platforms did not provide the features I wanted or were aimed at different aspects (like
                  achievement tracking).
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                  I also don&apos;t want to be a victim of enshittification and be forced to migrate my library again
                  to something different.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 0 }}>
                  This way I can change this platform when I want, however I want.
                </Typography>
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">Will you add features?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" component="div">
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                  Maybe — some features are planned (community feedback).
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 0 }}>
                  If you want a new feature, please add an issue on{' '}
                  <MuiLink
                    href={GITHUB_PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                  >
                    GitHub
                  </MuiLink>
                  .
                </Typography>
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">
                I would like to track my gaming as well, can I use your app?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" component="div">
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                  If you can set up your local environment and database, you can get the frontend and backend code at
                  the{' '}
                  <MuiLink
                    href={GITHUB_PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                  >
                    GitHub
                  </MuiLink>{' '}
                  linked below.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 0 }}>
                  For now this online site is not intended for community tracking.
                </Typography>
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">
                I have a question about X, can I contact you?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Yes! You can send an email to{' '}
                <MuiLink href="mailto:atypicalbacklog@gmail.com" underline="hover">
                  atypicalbacklog@gmail.com
                </MuiLink>{' '}
                or use{' '}
                <MuiLink
                  href={BLUESKY_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                >
                  Bluesky
                </MuiLink>
                . (Maybe in the future even Discord? Depends on demand.)
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">
                Outrage, you didn&apos;t play Game X / you rated Game X Tier Y, I want to tell you how you are wrong!
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Sorry to disappoint. Opinions are subjective — if you want to talk about it, contact me via email or
                use{' '}
                <MuiLink
                  href={BLUESKY_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                >
                  Bluesky
                </MuiLink>
                . (Maybe in the future even Discord? Depends on demand.)
              </Typography>
            </AccordionDetails>
          </Accordion>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, ...glossaryAnchorScrollSx }} id={GLOSSARY_SECTION_ID}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Glossary
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: 2,
              alignItems: 'start',
            }}
          >
            <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Console &amp; Platform
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                Console is the hardware ecosystem; platform is the concrete version or store under that
                ecosystem. Sometimes stuff is grouped in rough consoles (Mobile, Arcade, etc.).
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  columnGap: 2,
                  rowGap: 0.35,
                }}
              >
                <Typography variant="body2"><strong>PC</strong> = Personal Computer</Typography>
                <Typography variant="body2"><strong>DOS</strong> = PC-DOS / MS-DOS</Typography>
                <Typography variant="body2"><strong>C64</strong> = Commodore C64</Typography>
                <Typography variant="body2"><strong>Mac</strong> = Macintosh</Typography>
                <Typography variant="body2"><strong>Mobile</strong> = Android Mobile</Typography>
                <Typography variant="body2"><strong>iOS</strong> = Apple Mobile</Typography>
                <Typography variant="body2"><strong>PS</strong> = PlayStation</Typography>
                <Typography variant="body2"><strong>PS2</strong> = PlayStation 2</Typography>
                <Typography variant="body2"><strong>PS3</strong> = PlayStation 3</Typography>
                <Typography variant="body2"><strong>PS4</strong> = PlayStation 4</Typography>
                <Typography variant="body2"><strong>PS5</strong> = PlayStation 5</Typography>
                <Typography variant="body2"><strong>PSP</strong> = PlayStation Portable</Typography>
                <Typography variant="body2"><strong>PSVita</strong> = PlayStation Vita</Typography>
                <Typography variant="body2"><strong>SMD</strong> = Sega Mega Drive/Genesis</Typography>
                <Typography variant="body2"><strong>Dreamcast</strong> = Dreamcast</Typography>
                <Typography variant="body2"><strong>NES</strong> = Nintendo Entertainment System</Typography>
                <Typography variant="body2"><strong>SNES</strong> = Super NES</Typography>
                <Typography variant="body2"><strong>N64</strong> = Nintendo 64</Typography>
                <Typography variant="body2"><strong>NGC</strong> = Nintendo GameCube</Typography>
                <Typography variant="body2"><strong>Wii</strong> = Nintendo Wii</Typography>
                <Typography variant="body2"><strong>WiiU</strong> = Nintendo Wii U</Typography>
                <Typography variant="body2"><strong>Switch</strong> = Nintendo Switch</Typography>
                <Typography variant="body2"><strong>Switch2</strong> = Nintendo Switch 2</Typography>
                <Typography variant="body2"><strong>GB</strong> = Game Boy</Typography>
                <Typography variant="body2"><strong>GBC</strong> = Game Boy Color</Typography>
                <Typography variant="body2"><strong>GBA</strong> = Game Boy Advance</Typography>
                <Typography variant="body2"><strong>NDS</strong> = Nintendo DS</Typography>
                <Typography variant="body2"><strong>3DS</strong> = Nintendo 3DS</Typography>
                <Typography variant="body2"><strong>Xbox</strong> = Xbox</Typography>
                <Typography variant="body2"><strong>Xbox360</strong> = Xbox 360</Typography>
                <Typography variant="body2"><strong>XbOne</strong> = Xbox One</Typography>
                <Typography variant="body2"><strong>XboxXS</strong> = Xbox Series X/S</Typography>
                <Typography variant="body2"><strong>Arcade</strong> = Arcade Cabinets</Typography>
                <Typography variant="body2"><strong>VR</strong> = Virtual Reality</Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Playthrough Types
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                Describe the style of play for that year's game interactions.
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2"><strong>Solo</strong> = played alone</Typography>
                <Typography variant="body2"><strong>Coop</strong> = played in cooperation with the same fixed players/group</Typography>
                <Typography variant="body2"><strong>Multiplayer</strong> = played with various people I know personally, with random assortment</Typography>
                <Typography variant="body2"><strong>Casual</strong> = No completion intention/objective for this playthrough</Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Backlog + Backlog Score
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                If a game is part of the Backlog, I intend to play this game / play more / finish it / complete it.
                Therefore a game can be in backlog while still having playthrough/completion history.                
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Backlog score</strong> is calculated with time since game release, game acquisition and other hidden factors.
                It exists to provide a sort of ranking and prioritization of games, even though I disregard it often.
              </Typography>
            </Box>
            </Stack>

            <Stack spacing={2}>
            <Box id={GLOSSARY_COMPLETION_STATES_ID} sx={glossaryAnchorScrollSx}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Completion States (Played)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                Completion state of an instance or DLC (independent from backlog)
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2"><strong>None</strong> = No history with this game, no plan on playing it</Typography>
                <Typography variant="body2"><strong>Started</strong> = Started playing this or playthrough in progress</Typography>
                <Typography variant="body2"><strong>In Progress</strong> = savegame/progression exists and will be continued (now or soon)</Typography>
                <Typography variant="body2"><strong>Finished</strong> = finished main game, engaged with most of main content (at time of playthrough)</Typography>
                <Typography variant="body2"><strong>FinishedPlus</strong> = finished, but included plenty of side quests and additional content, but not everything</Typography>
                <Typography variant="body2"><strong>Completed</strong> = Seen every meaningful content of the game, and / or got all achievements</Typography>
                <Typography variant="body2"><strong>Postponed</strong> = paused playthrough, back in backlog</Typography>
                <Typography variant="body2"><strong>Abandoned</strong> = was played, dropped without "finishing" it / engaging with most of it</Typography>
                <Typography variant="body2"><strong>Cancelled</strong> = was part of backlog, removed without playing</Typography>
                <Typography variant="body2"><strong>Backlog</strong> = intend to play this game, but not yet started</Typography>
              </Stack>
              <Typography variant="subtitle2" sx={{ mt: 1.25, mb: 0.5 }}>
                Filter intentions (Library: &quot;Filter Played&quot;)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                Groups various states to make current state easier to understand
              </Typography>
              <Stack spacing={0.4}>
                <Typography variant="body2"><strong>Completed</strong> = Completed</Typography>
                <Typography variant="body2"><strong>Finished</strong> = Completed, FinishedPlus, Finished</Typography>
                <Typography variant="body2"><strong>Playing</strong> = In Progress, Started</Typography>
                <Typography variant="body2"><strong>Played</strong> = Completed, FinishedPlus, Finished, Postponed, Abandoned</Typography>
                <Typography variant="body2"><strong>Backlog</strong> = Postponed, Backlog</Typography>
                <Typography variant="body2"><strong>Unplayed</strong> = None, Cancelled</Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Variant
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                Variant explains how a release relates to original availability and platform spread at time of my acquisition.
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2"><strong>Original</strong> = first/native release on this console</Typography>
                <Typography variant="body2"><strong>Port</strong> = adapted release to another platform/context, sometimes remasters count, sometimes not, ~6 months after original release, otherwise Multiplatform</Typography>
                <Typography variant="body2"><strong>Multiplatform</strong> = launched across multiple consoles/platforms at time of release/acquisition</Typography>
                <Typography variant="body2"><strong>Console Exclusive</strong> = still limited to consoles at time of acquisition</Typography>
              </Stack>
            </Box>
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}
