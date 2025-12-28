/**
 * Canvas utility functions
 */

/**
 * Scale a value based on canvas size
 */
export function scaled(canvas: HTMLCanvasElement, value: number): number {
  const scale = canvas.width / 500; // Base scale at 500px width
  return value * scale;
}

/**
 * Convert SVG string to data URL
 */
export function svgToDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

/**
 * Line break text utility
 */
export const lineBreakedText = {
  getWidth(ctx: CanvasRenderingContext2D, lines: string[]): number {
    return Math.max(...lines.map(line => ctx.measureText(line).width));
  },

  getHeight(ctx: CanvasRenderingContext2D): number {
    return ctx.measureText('M').width * 1.2; // Approximate line height
  },

  draw(
    ctx: CanvasRenderingContext2D,
    lines: string[],
    x: number,
    y: number,
    horizontal: { alignment: 'left' | 'center' | 'right'; width: number },
    vertical: { alignment: 'top' | 'center' | 'bottom'; height: number }
  ): void {
    const lineHeight = this.getHeight(ctx);
    const totalHeight = lines.length * lineHeight;

    let startY = y;
    if (vertical.alignment === 'center') {
      startY = y + (vertical.height - totalHeight) / 2;
    } else if (vertical.alignment === 'bottom') {
      startY = y + vertical.height - totalHeight;
    }

    lines.forEach((line, index) => {
      let lineX = x;
      if (horizontal.alignment === 'center') {
        lineX = x + horizontal.width / 2;
      } else if (horizontal.alignment === 'right') {
        lineX = x + horizontal.width;
      }

      ctx.strokeText(line, lineX, startY + index * lineHeight);
      ctx.fillText(line, lineX, startY + index * lineHeight);
    });
  },
};



