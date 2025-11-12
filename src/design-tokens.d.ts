/**
 * TypeScript declarations for design-tokens.js
 */

export interface ColorTokenMeta {
  value: string;
  ref: string;
}

export interface ColorTokenMetaMap {
  [key: string]: ColorTokenMeta | { [key: string]: ColorTokenMeta };
}

export interface SpacingTokenMeta {
  value: number;
  unit: string;
  ref: string | number;
}

export interface SpacingTokenMetaMap {
  [key: string]: SpacingTokenMeta;
}

export interface RadiusTokenMeta {
  value: number;
  unit: string;
  ref: string | number;
}

export interface RadiusTokenMetaMap {
  [key: string]: RadiusTokenMeta;
}

export const vcaColors: Record<string, string | Record<string, string>>;
export const vcaColorsMeta: ColorTokenMetaMap;
export const vcaSpacing: Record<string, string>;
export const vcaSpacingMeta: SpacingTokenMetaMap;
export const vcaRadius: Record<string, string>;
export const vcaRadiusMeta: RadiusTokenMetaMap;

