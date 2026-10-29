/** Kenyan mobile: 07…, 01…, +2547…, 2541… with optional spaces or dashes. */
export function isKenyanPhone(value: string): boolean {
  const digits = value.replace(/[\s\-().]/g, "");
  return /^(?:\+?254|0)[17]\d{8}$/.test(digits);
}
