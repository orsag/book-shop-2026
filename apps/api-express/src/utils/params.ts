// src/utils/params.ts
export function getRequiredParam(param: string | string[] | undefined): string {
  if (!param) {
    throw new Error('Required parameter is missing');
  }
  return Array.isArray(param) ? param[0] : param;
}
