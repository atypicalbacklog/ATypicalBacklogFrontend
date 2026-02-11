import type { ConsoleDto } from '../types/referenceData';

/**
 * Creates a Map for O(1) console lookups by UID.
 * Useful for performance optimization when frequently looking up consoles.
 * 
 * @param consoles - Array of console DTOs
 * @returns Map with console UID as key and console DTO as value
 */
export function createConsoleMap(consoles: ConsoleDto[]): Map<string, ConsoleDto> {
  const map = new Map<string, ConsoleDto>();
  consoles.forEach((console) => {
    if (console?.uid) {
      map.set(console.uid, console);
    }
  });
  return map;
}

/**
 * Creates a Map for O(1) console name lookups (lowercase) by UID.
 * Useful for case-insensitive filtering/searching.
 * 
 * @param consoles - Array of console DTOs
 * @returns Map with console UID as key and lowercase console name as value
 */
export function createConsoleNameMap(consoles: ConsoleDto[]): Map<string, string> {
  const map = new Map<string, string>();
  consoles.forEach((console) => {
    if (console?.uid && console?.name) {
      map.set(console.uid, console.name.toLowerCase());
    }
  });
  return map;
}
