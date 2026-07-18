// src/utils/params.ts
export function getRequiredParam(param: string | string[] | undefined): string {
  if (!param) {
    throw new Error('Required parameter is missing');
  }
  return Array.isArray(param) ? param[0] : param;
}

// Utility for parsing query parameters with safety fallback layers (Option 3 style)
export function getSingleQueryParam(param: any): string | undefined {
  if (!param) return undefined;
  return Array.isArray(param) ? (param[0] as string) : (param as string);
}
