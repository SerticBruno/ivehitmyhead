import type MemeCanvasController from './MemeCanvasController';
import { scaled } from '@/lib/utils/canvas';
import MathHelper from '@/lib/utils/math';

export interface Filterable<T extends readonly ValidOptionTypes[]> {
  valid: T;
  current: this['valid'][number];
}

export interface ExtendedString {
  value: string;
  multiline?: boolean;
}

export interface ImageSource {
  src: string;
}

export type ValidOptionTypes =
  | string
  | number
  | boolean
  | Filterable<readonly (string | number | boolean)[]>
  | ExtendedString
  | ImageSource;

export type ValidateOptions<T> = keyof T extends ValidOptionTypes ? T : never;

export type Settings<
  T extends Record<string, ValidOptionTypes> = Record<string, ValidOptionTypes>
> = {
  [K in keyof T]: T[K];
};

export const enum MemeElementHandle {
  TOP_LEFT = 0,
  TOP_RIGHT = 1,
  BOTTOM_LEFT = 2,
  BOTTOM_RIGHT = 3,
  ROTATION_HANDLE = 4,
}

export const getHandleSize = (controller: MemeCanvasController) =>
  scaled(controller.canvas, controller.isTouch ? 20 : 14);

export const getRotationHandleSize = (controller: MemeCanvasController) =>
  scaled(controller.canvas, controller.isTouch ? 28 : 22);

export function getHandlePos(
  element: MemeElement,
  handle: MemeElementHandle
): { x: number; y: number } {
  switch (handle) {
    case MemeElementHandle.TOP_LEFT:
      return {
        x: element.x,
        y: element.y,
      };
    case MemeElementHandle.TOP_RIGHT:
      return {
        x: element.x + element.width,
        y: element.y,
      };
    case MemeElementHandle.BOTTOM_LEFT:
      return {
        x: element.x,
        y: element.y + element.height,
      };
    case MemeElementHandle.BOTTOM_RIGHT:
      return {
        x: element.x + element.width,
        y: element.y + element.height,
      };
    case MemeElementHandle.ROTATION_HANDLE:
      return {
        x: element.x + element.width / 2,
        y: element.y - getRotationHandleSize(element.controller) * 1.5,
      };
  }
}

abstract class MemeElement<T extends Settings = Settings> {
  public x: number = 0;
  public y: number = 0;
  protected offsetX: number = 0;
  protected offsetY: number = 0;
  protected handle: MemeElementHandle | null = null;
  protected _width: number = 0;
  protected _height: number = 0;

  // Degrees
  public rotation: number = 0;
  public locked: boolean = false;

  protected get ctx(): CanvasRenderingContext2D {
    return this.controller.renderer.ctx;
  }

  constructor(
    public controller: MemeCanvasController,
    public settings: T
  ) {}

  public created(): void {}
  public draw(): void {}

  public getMinSize() {
    return {
      width: scaled(this.ctx.canvas, 20),
      height: scaled(this.ctx.canvas, 20),
    };
  }

  public getMinWidth(): number {
    return this.getMinSize().width;
  }

  public getMinHeight(): number {
    return this.getMinSize().height;
  }

  // Events - these are meant to be overridden by subclasses
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onPress(_x: number, _y: number): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onRelease(_x: number, _y: number): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onDoubleClick(_x: number, _y: number): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onKeyTyped(_key: string, _ctrl: boolean, _shift: boolean): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onChanged(_isSetting: boolean, _key: keyof T): void {}

  // Element manipulation
  public prepareDrag(x: number, y: number): void {
    this.offsetX = Math.round(x - this.x);
    this.offsetY = Math.round(y - this.y);
  }

  public drag(x: number, y: number): void {
    if (this.locked) return;

    this.x = MathHelper.clamp(
      Math.round(x - this.offsetX),
      0,
      this.ctx.canvas.width - this.width
    );
    this.y = MathHelper.clamp(
      Math.round(y - this.offsetY),
      0,
      this.ctx.canvas.height - this.height
    );
  }

  protected _rotationPrev: number = 0;

  public prepareHandle(
    handle: MemeElementHandle | null,
    x: number,
    y: number
  ): void {
    if (handle !== null) {
      const handlePos = getHandlePos(this, handle);
      this.offsetX = Math.round(x - handlePos.x);
      this.offsetY = Math.round(y - handlePos.y);
    }

    this._rotationPrev = this.rotation;
    this.handle = handle;
  }

  public handleInteraction(mouseX: number, mouseY: number): void {
    if (this.locked) return;

    switch (this.handle) {
      case MemeElementHandle.ROTATION_HANDLE: {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const angle =
          (Math.atan2(mouseY - centerY, mouseX - centerX) * 180) / Math.PI;

        this.rotation = ((Math.round(angle) + 90 + this._rotationPrev) % 360);
        if (this.rotation < 0) this.rotation += 360;
        break;
      }

      case MemeElementHandle.TOP_LEFT: {
        const newX = Math.round(mouseX - this.offsetX);
        const newY = Math.round(mouseY - this.offsetY);
        const newWidth = this.x + this.width - newX;
        const newHeight = this.y + this.height - newY;

        if (newWidth >= this.getMinWidth()) {
          this.width = newWidth;
          this.x = newX;
        }

        if (newHeight >= this.getMinHeight()) {
          this.height = newHeight;
          this.y = newY;
        }
        break;
      }

      case MemeElementHandle.TOP_RIGHT: {
        const newY = Math.round(mouseY - this.offsetY);
        const newWidth = mouseX - this.x - this.offsetX;
        const newHeight = this.y + this.height - newY;

        if (newWidth >= this.getMinWidth()) this.width = newWidth;

        if (newHeight >= this.getMinHeight()) {
          this.height = newHeight;
          this.y = newY;
        }
        break;
      }

      case MemeElementHandle.BOTTOM_LEFT: {
        const newX = Math.round(mouseX - this.offsetX);
        const newWidth = this.x + this.width - newX;
        const newHeight = mouseY - this.y - this.offsetY;

        if (newWidth >= this.getMinWidth()) {
          this.width = newWidth;
          this.x = newX;
        }

        if (newHeight >= this.getMinHeight()) this.height = newHeight;
        break;
      }

      case MemeElementHandle.BOTTOM_RIGHT: {
        const newWidth = mouseX - this.x - this.offsetX;
        const newHeight = mouseY - this.y - this.offsetY;

        if (newWidth >= this.getMinWidth()) this.width = newWidth;

        if (newHeight >= this.getMinHeight()) this.height = newHeight;
        break;
      }
    }
  }

  // Helpers
  public getCommonProperties(): Record<string, ValidOptionTypes> {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      locked: this.locked,
    };
  }

  public handleAt(x: number, y: number): MemeElementHandle | null {
    return MemeElement.handleAt(this, x, y);
  }

  public intersects(x: number, y: number): boolean {
    return MemeElement.intersects(this, x, y);
  }

  public intersectsInside(
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    return MemeElement.intersectsInside(this, x, y, width, height);
  }

  public static handleAt(
    element: MemeElement,
    x: number,
    y: number
  ): MemeElementHandle | null {
    // Check handles first (they have priority)
    const handles = [
      MemeElementHandle.ROTATION_HANDLE,
      MemeElementHandle.TOP_LEFT,
      MemeElementHandle.TOP_RIGHT,
      MemeElementHandle.BOTTOM_LEFT,
      MemeElementHandle.BOTTOM_RIGHT,
    ];

    // Transform click coordinates to element's local coordinate system if rotated
    let localX = x;
    let localY = y;
    
    if (element.rotation !== 0) {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      const angleRad = -(element.rotation * Math.PI) / 180; // Negative for inverse rotation
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      
      // Translate to origin (center of element)
      const dx = x - centerX;
      const dy = y - centerY;
      
      // Apply inverse rotation
      localX = dx * cos - dy * sin + centerX;
      localY = dx * sin + dy * cos + centerY;
    }

    for (const handle of handles) {
      const { x: handleX, y: handleY } = getHandlePos(element, handle);
      const size = Math.round(
        handle === MemeElementHandle.ROTATION_HANDLE
          ? getRotationHandleSize(element.controller)
          : getHandleSize(element.controller)
      );
      // Increase hit area for better usability - much larger hit area for easier clicking
      // Even larger hit area on touch devices for better mobile interaction
      const baseOffset = handle === MemeElementHandle.ROTATION_HANDLE ? 15 : 25;
      const touchMultiplier = element.controller.isTouch ? 1.5 : 1;
      const offset = size / 2 + (baseOffset * touchMultiplier);

      // All handles are drawn in the rotated coordinate system, so check in local space
      // Use distance calculation for more accurate hit detection with rotation
      const dx = localX - handleX;
      const dy = localY - handleY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= offset) {
        return handle;
      }
    }

    return null;
  }

  public static intersects(element: MemeElement, x: number, y: number): boolean {
    // Add a small padding for touch devices to make selection easier
    const padding = element.controller.isTouch ? scaled(element.controller.canvas, 5) : 0;
    return (
      x >= element.x - padding &&
      x <= element.x + element.width + padding &&
      y >= element.y - padding &&
      y <= element.y + element.height + padding
    );
  }

  public static intersectsInside(
    element: MemeElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    return (
      x <= element.x + element.width &&
      x + width >= element.x &&
      y <= element.y + element.height &&
      y + height >= element.y
    );
  }

  // Getters and Setters
  public get width(): number {
    return Math.max(this._width, this.getMinWidth(), 20);
  }

  public set width(value: number) {
    this._width = value;
  }

  public get height(): number {
    return Math.max(this._height, this.getMinHeight(), 20);
  }

  public set height(value: number) {
    this._height = value;
  }
}

export type MemeElementConstructor = new (
  controller: MemeCanvasController
) => MemeElement;

export default MemeElement;

