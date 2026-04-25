export const PRINT_DPI = 300;
export const MM_PER_INCH = 25.4;

export function mmToPx(mm: number, dpi: number = PRINT_DPI): number {
  return Math.round((mm / MM_PER_INCH) * dpi);
}

export function pxToMm(px: number, dpi: number = PRINT_DPI): number {
  return (px / dpi) * MM_PER_INCH;
}

export const A4_PORTRAIT_MM = {
  width: 210,
  height: 297,
} as const;

export const A4_PORTRAIT_PX = {
  width: mmToPx(A4_PORTRAIT_MM.width),
  height: mmToPx(A4_PORTRAIT_MM.height),
} as const;

export const GUIDE_SIZES_MM = {
  small: {
    width: 40,
    height: 60,
  },
  large: {
    width: 51,
    height: 70,
  },
} as const;

export const GUIDE_SIZES_PX = {
  small: {
    width: mmToPx(GUIDE_SIZES_MM.small.width),
    height: mmToPx(GUIDE_SIZES_MM.small.height),
  },
  large: {
    width: mmToPx(GUIDE_SIZES_MM.large.width),
    height: mmToPx(GUIDE_SIZES_MM.large.height),
  },
} as const;

export const GUIDE_CORNER_RADIUS_MM = 4;
export const GUIDE_CORNER_RADIUS_PX = mmToPx(GUIDE_CORNER_RADIUS_MM);
