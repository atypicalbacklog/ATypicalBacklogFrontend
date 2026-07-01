export interface TrackingCoverageEntry {
  label: string;
  hint?: string;
  percent: number;
}

export const TRACKING_COVERAGE_ENTRIES: TrackingCoverageEntry[] = [
  {
    label: 'All Games played since 2017',
    hint: 'start of data tracking',
    percent: 100,
  },
  {
    label: 'All Games I own / have digital access to',
    percent: 100,
  },
  {
    label: 'All Games I played released after 12.02.2002',
    hint: 'because of previous personal project, I have this data',
    percent: 75,
  },
  {
    label: 'All missing games I played since 6th console generation',
    percent: 0,
  },
  {
    label: 'All missing games I played since 5th console generation',
    percent: 0,
  },
  {
    label: 'All missing games older than that',
    percent: 0,
  },
  {
    label: 'All other remaining missing games',
    hint: 'mobile, freeware, flash games, etc.',
    percent: 0,
  },
];
