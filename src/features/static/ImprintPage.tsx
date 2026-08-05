import { Box, Link, Paper, Stack, Typography } from '@mui/material';

const CONTACT_EMAIL = 'atypicalbacklog@gmail.com';

export default function ImprintPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
        Imprint
      </Typography>

      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Purpose
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A free, non-commercial overview of private video game consumption habits, including
            subjective reviews of that behavior.
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Legal Notice
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Media Owner:</strong>
              <br />
              Thomas Fröstl
            </Typography>
            <Typography variant="body2">
              <strong>Location:</strong>
              <br />
              Linz, Austria
            </Typography>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Contact
          </Typography>
          <Typography variant="body2">
            <strong>Contact for copyright inquiries:</strong>
            <br />
            <Link href={`mailto:${CONTACT_EMAIL}`} underline="hover">
              {CONTACT_EMAIL}
            </Link>
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Copyright Notices
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The data archived on this website (especially images) originates from{' '}
            <strong>publicly accessible sources</strong> such as{' '}
            <Link href="https://www.igdb.com" target="_blank" rel="noopener noreferrer" underline="hover">
              IGDB
            </Link>{' '}
            and{' '}
            <Link href="https://www.wikipedia.org" target="_blank" rel="noopener noreferrer" underline="hover">
              Wikipedia
            </Link>
            . The use of this content is done in good faith and in compliance with the respective{' '}
            <strong>terms of use of the sources</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            If any copyrights are nevertheless violated, I kindly request <strong>immediate notification</strong>{' '}
            via email. In the event of justified claims, the affected content will be{' '}
            <strong>removed or appropriately marked without delay</strong>.
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Data Privacy Notice
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This website <strong>does not use cookies</strong> and <strong>does not store any personal data</strong>{' '}
            of visitors.
            <br />
            There are <strong>no GDPR-relevant processing activities</strong>.
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Disclaimer
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              The content of this website is provided <strong>without warranty</strong>.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No liability is assumed for the <strong>accuracy, completeness or timeliness</strong> of the
              information provided.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The use of this website is at the <strong>user&apos;s own risk</strong>.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
