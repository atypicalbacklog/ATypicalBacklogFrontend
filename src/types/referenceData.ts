export interface SimpleLookupDto {
  uid: string;
  name: string;
  order?: number;
}

export interface ConsoleDto {
  uid: string;
  name: string;
  fullname: string;
}

export interface PlatformDto {
  uid: string;
  name: string;
  consoleUid: string;
  hideInChoices: boolean;
}

export interface InputDto {
  uid: string;
  name: string;
  platformUid: string;
}

export interface ReferenceDataPayload {
  version: string;
  generatedAt: string;
  data: {
    completionStates: SimpleLookupDto[];
    consoles: ConsoleDto[];
    platforms: PlatformDto[];
    inputs: InputDto[];
    variants: SimpleLookupDto[];
    playthroughStates: SimpleLookupDto[];
    playthroughTypes: SimpleLookupDto[];
    tiers: SimpleLookupDto[];
  };
}
