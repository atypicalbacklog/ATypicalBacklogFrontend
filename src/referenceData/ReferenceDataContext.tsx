import { createContext, useContext, useEffect, useState } from 'react';
import { initialFetchBegin, initialFetchEnd } from '../app/initialFetchGuard';
import { ReferenceDataPayload } from '../types/referenceData';
import { fetchReferenceData } from '../services/referenceDataApi';

interface ReferenceDataState {
  referenceData: ReferenceDataPayload | null;
  isLoaded: boolean;
}

const ReferenceDataContext = createContext<ReferenceDataState | undefined>(undefined);

export function ReferenceDataProvider({ children }: { children: React.ReactNode }) {
  const [referenceData, setReferenceData] = useState<ReferenceDataPayload | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchReferenceData().then((data) => {
      if (!cancelled) {
        setReferenceData(data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ReferenceDataContext.Provider
      value={{
        referenceData,
        isLoaded: referenceData !== null,
      }}
    >
      {children}
    </ReferenceDataContext.Provider>
  );
}

export function useReferenceData() {
  const ctx = useContext(ReferenceDataContext);
  if (!ctx) {
    throw new Error('useReferenceData must be used within ReferenceDataProvider');
  }
  return ctx;
}
