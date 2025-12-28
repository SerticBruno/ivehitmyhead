/**
 * Math utility functions
 */

class MathHelper {
  /**
   * Clamp a value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Calculate the size of a rotated rectangle
   */
  static sizeOfRotatedRect(
    width: number,
    height: number,
    angle: number
  ): { width: number; height: number } {
    const cos = Math.abs(Math.cos(angle));
    const sin = Math.abs(Math.sin(angle));
    
    return {
      width: width * cos + height * sin,
      height: width * sin + height * cos,
    };
  }
}

export default MathHelper;



