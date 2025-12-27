import type MemeCanvasController from './MemeCanvasController';
import { lineBreakedText, scaled } from '@/lib/utils/canvas';
import MathHelper from '@/lib/utils/math';
import MemeElement, {
  type ExtendedString,
  type Filterable,
  type ValidateOptions,
  MemeElementHandle,
} from './MemeElement';

export const HTextAlignment = ['left', 'center', 'right'] as const;
export const VTextAlignment = ['top', 'center', 'bottom'] as const;

export type TextElementSettings = ValidateOptions<{
  text: ExtendedString;
  font_family: string;
  font_size: number;
  color: string;
  stroke: string;
  stroke_width: number;
  horizontal_align: Filterable<typeof HTextAlignment>;
  vertical_align: Filterable<typeof VTextAlignment>;
}>;

class TextElement extends MemeElement<TextElementSettings> {
  private _splitText: string[] = [];
  private readonly PADDING = 10; // Padding around text in pixels

  constructor(controller: MemeCanvasController) {
    const fontSize = scaled(controller.canvas, 32);
    super(controller, {
      text: {
        multiline: true,
        value: 'Text',
      },
      font_family: 'sans-serif',
      font_size: fontSize,
      color: 'white',
      stroke: 'black',
      stroke_width: scaled(controller.canvas, 3),
      horizontal_align: {
        valid: HTextAlignment,
        current: 'center',
      },
      vertical_align: {
        valid: VTextAlignment,
        current: 'center',
      },
    });

    // Initialize size immediately
    this.updateText();
    // Ensure size is set before element is positioned
    if (this.width === 0 || this.height === 0) {
      this.updateSizeToText();
    }
  }

  private updateText() {
    this._splitText = this.settings.text.value.split('\n');
    // Automatically update element size to match text size
    this.updateSizeToText();
  }

  private updateSizeToText() {
    const textSize = this.getTextSize();
    // Add padding around text for better visual spacing
    this._width = textSize.width + this.PADDING * 2;
    this._height = textSize.height + this.PADDING * 2;
  }

  private getTextSize() {
    this.ctx.font = this.buildFont();
    const width = Math.round(
      lineBreakedText.getWidth(this.ctx, this._splitText)
    );
    const height = Math.round(
      this._splitText.length * lineBreakedText.getHeight(this.ctx)
    );
    return { width, height };
  }

  public override draw(): void {
    this.ctx.font = this.buildFont();
    this.ctx.fillStyle = this.settings.color.replaceAll('none', 'transparent');
    this.ctx.strokeStyle = this.settings.stroke.replaceAll('none', 'transparent');
    this.ctx.lineWidth = this.settings.stroke_width;

    // Draw text with padding offset
    // Text is drawn at element position + padding
    const textX = this.x + this.PADDING;
    const textY = this.y + this.PADDING;
    
    // Draw each line of text
    const lineHeight = lineBreakedText.getHeight(this.ctx);
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    this._splitText.forEach((line, index) => {
      const y = textY + index * lineHeight;
      this.ctx.strokeText(line, textX, y);
      this.ctx.fillText(line, textX, y);
    });
  }

  public override onDoubleClick(): void {
    this.controller.selectedElements = [this];
    this.controller.emit('inputFocusRequest', {
      inputName: 'text',
    });
  }

  public override onChanged(
    isSetting: boolean,
    key: keyof TextElementSettings
  ): void {
    if (isSetting)
      switch (key) {
        case 'text':
          this.updateText();
          break;
        case 'font_size':
        case 'font_family':
          // Update size when font changes
          this.updateSizeToText();
          break;
      }
  }

  public override getMinSize() {
    // Return actual text size (not rotated bounds)
    return this.getTextSize();
  }

  public override handleInteraction(mouseX: number, mouseY: number): void {
    if (this.locked) return;

    if (this.handle === null) return;

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

      case MemeElementHandle.TOP_LEFT:
      case MemeElementHandle.TOP_RIGHT:
      case MemeElementHandle.BOTTOM_LEFT:
      case MemeElementHandle.BOTTOM_RIGHT: {
        // For text elements, resizing should scale the font size proportionally
        const currentTextSize = this.getTextSize();
        const currentWidth = this.width;
        const currentHeight = this.height;
        
        // Store the anchor point (opposite corner from the handle being dragged)
        // This point should remain fixed during resize
        let anchorX: number;
        let anchorY: number;
        
        switch (this.handle) {
          case MemeElementHandle.TOP_LEFT: {
            // Anchor is bottom-right corner
            anchorX = this.x + this.width;
            anchorY = this.y + this.height;
            break;
          }
          case MemeElementHandle.TOP_RIGHT: {
            // Anchor is bottom-left corner
            anchorX = this.x;
            anchorY = this.y + this.height;
            break;
          }
          case MemeElementHandle.BOTTOM_LEFT: {
            // Anchor is top-right corner
            anchorX = this.x + this.width;
            anchorY = this.y;
            break;
          }
          case MemeElementHandle.BOTTOM_RIGHT: {
            // Anchor is top-left corner
            anchorX = this.x;
            anchorY = this.y;
            break;
          }
          default:
            anchorX = this.x;
            anchorY = this.y;
        }
        
        // Calculate new dimensions based on handle
        let newWidth = this.width;
        let newHeight = this.height;

        switch (this.handle) {
          case MemeElementHandle.TOP_LEFT: {
            const newX = Math.round(mouseX - this.offsetX);
            const newY = Math.round(mouseY - this.offsetY);
            newWidth = anchorX - newX;
            newHeight = anchorY - newY;
            break;
          }
          case MemeElementHandle.TOP_RIGHT: {
            const newY = Math.round(mouseY - this.offsetY);
            newWidth = Math.round(mouseX - this.offsetX) - anchorX;
            newHeight = anchorY - newY;
            break;
          }
          case MemeElementHandle.BOTTOM_LEFT: {
            const newX = Math.round(mouseX - this.offsetX);
            newWidth = anchorX - newX;
            newHeight = Math.round(mouseY - this.offsetY) - anchorY;
            break;
          }
          case MemeElementHandle.BOTTOM_RIGHT: {
            newWidth = Math.round(mouseX - this.offsetX) - anchorX;
            newHeight = Math.round(mouseY - this.offsetY) - anchorY;
            break;
          }
        }

        // Ensure minimum size
        newWidth = Math.max(newWidth, this.getMinWidth());
        newHeight = Math.max(newHeight, this.getMinHeight());

        // Calculate scale factors
        const scaleX = newWidth / currentWidth;
        const scaleY = newHeight / currentHeight;
        const scale = Math.min(scaleX, scaleY); // Use smaller scale to maintain aspect ratio

        // Update font size proportionally
        const newFontSize = Math.max(12, this.settings.font_size * scale);
        this.settings.font_size = newFontSize;

        // Update element size to match new text size
        this.updateSizeToText();
        
        // Get the new text size after font change
        const newTextSize = this.getTextSize();
        const newElementWidth = newTextSize.width + this.PADDING * 2;
        const newElementHeight = newTextSize.height + this.PADDING * 2;
        
        // Adjust position to maintain the anchor point
        switch (this.handle) {
          case MemeElementHandle.TOP_LEFT: {
            // Anchor is bottom-right, so position from anchor
            this.x = anchorX - newElementWidth;
            this.y = anchorY - newElementHeight;
            break;
          }
          case MemeElementHandle.TOP_RIGHT: {
            // Anchor is bottom-left, so x stays same, y from anchor
            this.x = anchorX;
            this.y = anchorY - newElementHeight;
            break;
          }
          case MemeElementHandle.BOTTOM_LEFT: {
            // Anchor is top-right, so x from anchor, y stays same
            this.x = anchorX - newElementWidth;
            this.y = anchorY;
            break;
          }
          case MemeElementHandle.BOTTOM_RIGHT: {
            // Anchor is top-left, so position stays same
            this.x = anchorX;
            this.y = anchorY;
            break;
          }
        }

        break;
      }
    }
  }

  public buildFont(): string {
    return `${this.settings.font_size}px ${this.settings.font_family}`;
  }
}

export default TextElement;

