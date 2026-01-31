import { http } from './httpClient';
import { ReferenceDataPayload } from '../types/referenceData';

export function fetchReferenceData() {
  return http<ReferenceDataPayload>('/api/reference-data');
}
