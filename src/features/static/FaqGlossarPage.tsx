import { Accordion, AccordionDetails, AccordionSummary, Box, Paper, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FaqGlossarPage() {
  return (
    <Box sx={{ width: '100%', maxWidth: 1200 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        FAQ &amp; Glossar
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This page is meant for first-time visitors of the public version. Short version: this is my
        personal gaming tracker in read mode, so you can explore the data but not edit it.
      </Typography>

      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            What is this Website?
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Why I built this
              </Typography>
              <Typography variant="body2" color="text.secondary">
                I wanted one place where backlog, playtime, completions, and reviews actually belong
                together. Most tools are great at one thing, but not at the full journey from
                “planned” to “finished” to “how did I feel about it”.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                What data is tracked
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Games, game instances, DLC, console/platform context, variant type, playthroughs,
                tracked sessions (time bookings), backlog entries, completion states, and review/tier
                context. The stats/charts are derived from these core entities.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                What games are tracked
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mainly what I own, play, or intentionally keep in backlog scope. This includes base
                games and selected DLCs when they matter for progress or review context.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                How much is still missing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Always something. Recent data is usually near-complete; older history can be patchy
                and gets improved over time whenever I revisit it.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                How I manage backlog decisions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A game enters backlog with an added date and reason, and can later be removed with a
                removal date. Completion/playthrough data is tracked separately, then combined in
                backlog-completion views.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            FAQ (additional details)
          </Typography>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">How accurate is game data (release dates, etc.)?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Good overall, not perfect. Metadata is a mix of source data + curation, so edge cases
                (region differences, weird editions, older titles) can be slightly off.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">How correct/exact is time-tracked data?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                It is session-based and usually quite accurate for practical use. That said, manual
                tracking always has a little noise (late start/stop clicks, retro entries, etc.).
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
                The core source of truth here is internal session tracking (time bookings on
                playthroughs). External counters can be useful for sanity checks, but they are not the
                primary model.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">Why is there no achievement tracking?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                I intentionally focus on play history and backlog progression. Achievement tracking is
                possible in theory, but cross-platform consistency and maintenance cost are high.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">
                How frequent is data updated (last time since update)?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                It updates whenever I add/edit data. There is currently no global public “last sync”
                timestamp shown in the UI.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">Why didn&apos;t you just use X instead?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Because this is tailored to my exact workflow (instance modeling, backlog lifecycle,
                review context, and custom stats). Existing tools are great, just optimized for
                different priorities.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">Will you add features?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Very likely, step by step. Usually I prioritize reliability and clarity over shipping
                lots of features fast.
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
              <Typography variant="body2" color="text.secondary">
                This public deployment is currently a personal read-only showcase. It is not set up as
                a public multi-user SaaS with account onboarding/support.
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
                Yes. Use the contact details in Impressum and I&apos;ll respond when possible.
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
                Fair game. Opinions are subjective. If you want to disagree, do it passionately but
                kindly and we&apos;ll probably have a fun conversation.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
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
                Console is the hardware ecosystem; platform is the concrete target under that
                ecosystem. In short: console = family, platform = specific lane.
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
                <Typography variant="body2"><strong>PS</strong> = PlayStation</Typography>
                <Typography variant="body2"><strong>PS2</strong> = PlayStation 2</Typography>
                <Typography variant="body2"><strong>PS3</strong> = PlayStation 3</Typography>
                <Typography variant="body2"><strong>PS4</strong> = PlayStation 4</Typography>
                <Typography variant="body2"><strong>PS5</strong> = PlayStation 5</Typography>
                <Typography variant="body2"><strong>PSP</strong> = PlayStation Portable</Typography>
                <Typography variant="body2"><strong>Switch</strong> = Nintendo Switch</Typography>
                <Typography variant="body2"><strong>3DS</strong> = Nintendo 3DS</Typography>
                <Typography variant="body2"><strong>WiiU</strong> = Nintendo Wii U</Typography>
                <Typography variant="body2"><strong>NDS</strong> = Nintendo DS</Typography>
                <Typography variant="body2"><strong>Wii</strong> = Nintendo Wii</Typography>
                <Typography variant="body2"><strong>Xbox360</strong> = Xbox 360</Typography>
                <Typography variant="body2"><strong>GBA</strong> = Game Boy Advance</Typography>
                <Typography variant="body2"><strong>NGC</strong> = Nintendo GameCube</Typography>
                <Typography variant="body2"><strong>XbOne</strong> = Xbox One</Typography>
                <Typography variant="body2"><strong>Xbox</strong> = Xbox</Typography>
                <Typography variant="body2"><strong>Dreamcast</strong> = Dreamcast</Typography>
                <Typography variant="body2"><strong>GBC</strong> = Game Boy Color</Typography>
                <Typography variant="body2"><strong>N64</strong> = Nintendo 64</Typography>
                <Typography variant="body2"><strong>GB</strong> = Game Boy</Typography>
                <Typography variant="body2"><strong>SNES</strong> = Super NES</Typography>
                <Typography variant="body2"><strong>SMD</strong> = Sega Mega Drive/Genesis</Typography>
                <Typography variant="body2"><strong>NES</strong> = Nintendo Entertaiment System</Typography>
                <Typography variant="body2"><strong>Mobile</strong> = Android Mobile</Typography>
                <Typography variant="body2"><strong>IOS</strong> = Apple Mobile</Typography>
                <Typography variant="body2"><strong>Arcade</strong> = Arcade Cabinets</Typography>
                <Typography variant="body2"><strong>DOS</strong> = PC DOS / MS DOS</Typography>
                <Typography variant="body2"><strong>C64</strong> = Commodore C64</Typography>
                <Typography variant="body2"><strong>Mac</strong> = Macintosh</Typography>
                <Typography variant="body2"><strong>PSVita</strong> = Playstation Vita</Typography>
                <Typography variant="body2"><strong>XboxXS</strong> = Xbox Series X/S</Typography>
                <Typography variant="body2"><strong>VR</strong> = Virtual Reality</Typography>
                <Typography variant="body2"><strong>Switch2</strong> = Nintendo Switch 2</Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Playthrough Types
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                Playthrough type describes the run style/context.
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2"><strong>Solo</strong> = played alone</Typography>
                <Typography variant="body2"><strong>Coop</strong> = played in cooperation with the same fixed players/group</Typography>
                <Typography variant="body2"><strong>Multiplayer</strong> = competitive/online multi context, not strict coop campaign style</Typography>
                <Typography variant="body2"><strong>Casual</strong> = lighter/non-committed run context</Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Backlog + Backlog Score
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                Backlog is a game-level planning queue with add/remove lifecycle metadata and reason.
                A game can be in backlog while still having playthrough/completion history.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Backlog score</strong> is a backend-provided ranking metric used for ordering
                in backlog views. The exact formula is not exposed in the public endpoint contract.
              </Typography>
            </Box>
            </Stack>

            <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Completion States (Played)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                Completion state describes outcome/progress of an instance or DLC, independent from
                “was it in backlog”.
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2"><strong>None</strong> = no meaningful progress state assigned</Typography>
                <Typography variant="body2"><strong>Started</strong> = run begun, still early/in progress</Typography>
                <Typography variant="body2"><strong>In Progress</strong> = active progression</Typography>
                <Typography variant="body2"><strong>Finished</strong> = main objective done (non-100%)</Typography>
                <Typography variant="body2"><strong>FinishedPlus</strong> = finished with additional scope beyond base finish</Typography>
                <Typography variant="body2"><strong>Completed</strong> = full intended completion</Typography>
                <Typography variant="body2"><strong>Postponed</strong> = paused/deferred for now</Typography>
                <Typography variant="body2"><strong>Abandoned</strong> = intentionally dropped</Typography>
                <Typography variant="body2"><strong>Cancelled</strong> = tracking path intentionally cancelled/reset</Typography>
                <Typography variant="body2"><strong>Backlog</strong> = planning state, not yet actively progressed</Typography>
              </Stack>
              <Typography variant="subtitle2" sx={{ mt: 1.25, mb: 0.5 }}>
                Filter intentions (Library: &quot;Filter Played&quot;)
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
                Variant explains how a release relates to original availability and platform spread.
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2"><strong>Original</strong> = first/native release context</Typography>
                <Typography variant="body2"><strong>Port</strong> = adapted release to another platform/context</Typography>
                <Typography variant="body2"><strong>Multiplatform</strong> = launched across multiple effective platforms</Typography>
                <Typography variant="body2"><strong>Console Exclusive</strong> = limited to one console ecosystem</Typography>
              </Stack>
            </Box>
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}
