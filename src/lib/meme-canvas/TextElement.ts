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
  private _userHasSetSize: boolean = false; // Track if user has manually set size

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

    // Initialize size immediately (auto-size on creation)
    this.updateText();
    // Ensure size is set before element is positioned
    if (this.width === 0 || this.height === 0) {
      this.updateSizeToText();
    }
  }

  private updateText() {
    // Split by newlines first, then wrap each line
    const lines = this.settings.text.value.split('\n');
    
    // Only auto-size if user hasn't manually set the size
    if (!this._userHasSetSize) {
      // Auto-size: wrap text and update size to fit
      this._splitText = this.wrapText(lines);
      this.updateSizeToText();
    } else {
      // User has set size: only re-wrap text and update height
      // Store current position to prevent shifting
      const currentX = this.x;
      const currentY = this.y;
      
      this._splitText = this.wrapText(lines);
      this.updateHeightToText();
      
      // Restore position (in case height change caused any shift)
      this.x = currentX;
      this.y = currentY;
    }
  }

  private wrapText(lines: string[]): string[] {
    if (this._width <= this.getMinWidth() + this.PADDING * 2) {
      // If width is at minimum, don't wrap
      return lines;
    }

    this.ctx.font = this.buildFont();
    const maxWidth = this._width - this.PADDING * 2;
    const wrappedLines: string[] = [];

    for (const line of lines) {
      if (!line.trim()) {
        wrappedLines.push('');
        continue;
      }

      const words = line.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = this.ctx.measureText(testLine);

        if (metrics.width <= maxWidth || !currentLine) {
          // Word fits or it's the first word (must add it even if too long)
          currentLine = testLine;
        } else {
          // Word doesn't fit, start a new line
          wrappedLines.push(currentLine);
          currentLine = word;
        }
      }

      if (currentLine) {
        wrappedLines.push(currentLine);
      }
    }

    return wrappedLines;
  }

  private updateSizeToText() {
    const textSize = this.getTextSize();
    // Add padding around text for better visual spacing
    // Always update size when this method is called (it's only called when we want to auto-size)
    this._width = textSize.width + this.PADDING * 2;
    this._height = textSize.height + this.PADDING * 2;
  }

  private updateHeightToText() {
    this.ctx.font = this.buildFont();
    const height = Math.round(
      this._splitText.length * lineBreakedText.getHeight(this.ctx)
    );
    this._height = height + this.PADDING * 2;
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

    // Calculate text area (element size minus padding)
    const textAreaWidth = this._width - this.PADDING * 2;
    const textAreaHeight = this._height - this.PADDING * 2;
    const textX = this.x + this.PADDING;
    const textY = this.y + this.PADDING;
    
    // Draw each line of text with proper alignment
    const lineHeight = lineBreakedText.getHeight(this.ctx);
    this.ctx.textBaseline = 'top';
    
    // Calculate vertical alignment offset
    const totalTextHeight = this._splitText.length * lineHeight;
    let startY = textY;
    if (this.settings.vertical_align.current === 'center') {
      startY = textY + (textAreaHeight - totalTextHeight) / 2;
    } else if (this.settings.vertical_align.current === 'bottom') {
      startY = textY + textAreaHeight - totalTextHeight;
    }
    
    this._splitText.forEach((line, index) => {
      const y = startY + index * lineHeight;
      
      // Set horizontal alignment
      let x = textX;
      if (this.settings.horizontal_align.current === 'center') {
        this.ctx.textAlign = 'center';
        x = textX + textAreaWidth / 2;
      } else if (this.settings.horizontal_align.current === 'right') {
        this.ctx.textAlign = 'right';
        x = textX + textAreaWidth;
      } else {
        this.ctx.textAlign = 'left';
      }
      
      this.ctx.strokeText(line, x, y);
      this.ctx.fillText(line, x, y);
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
          // Re-wrap text when font changes
          // Store current position to prevent shifting
          const currentX = this.x;
          const currentY = this.y;
          
          const lines = this.settings.text.value.split('\n');
          this._splitText = this.wrapText(lines);
          // If user has set size, only update height. Otherwise auto-size.
          if (this._userHasSetSize) {
            this.updateHeightToText();
          } else {
            this.updateSizeToText();
          }
          
          // Restore position (in case size change caused any shift)
          this.x = currentX;
          this.y = currentY;
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
        // For text elements, resizing should change the text box area
        // Font size remains unchanged - only width/height change
        
        // Store current dimensions and position before resize
        const currentX = this.x;
        const currentY = this.y;
        const currentWidth = this._width;
        const currentHeight = this._height;
        
        // Store the anchor point (opposite corner from the handle being dragged)
        // This point should remain fixed during resize
        let anchorX: number;
        let anchorY: number;
        
        switch (this.handle) {
          case MemeElementHandle.TOP_LEFT: {
            // Anchor is bottom-right corner
            anchorX = currentX + currentWidth;
            anchorY = currentY + currentHeight;
            break;
          }
          case MemeElementHandle.TOP_RIGHT: {
            // Anchor is bottom-left corner
            anchorX = currentX;
            anchorY = currentY + currentHeight;
            break;
          }
          case MemeElementHandle.BOTTOM_LEFT: {
            // Anchor is top-right corner
            anchorX = currentX + currentWidth;
            anchorY = currentY;
            break;
          }
          case MemeElementHandle.BOTTOM_RIGHT: {
            // Anchor is top-left corner
            anchorX = currentX;
            anchorY = currentY;
            break;
          }
          default:
            anchorX = currentX;
            anchorY = currentY;
        }
        
        // Calculate new dimensions based on handle and mouse position
        let newWidth = currentWidth;
        let newHeight = currentHeight;

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

        // Set the new width first (font size stays the same)
        this._width = newWidth;
        
        // Mark that user has manually set the size (after setting width)
        this._userHasSetSize = true;
        
        // Re-wrap text based on new width
        const lines = this.settings.text.value.split('\n');
        this._splitText = this.wrapText(lines);
        
        // Calculate minimum height needed for wrapped text
        const minHeightForText = this.getTextSize().height + this.PADDING * 2;
        // Use the larger of user-specified height or minimum needed for text
        this._height = Math.max(newHeight, minHeightForText);
        
        // Adjust position to maintain the anchor point (after width and height are finalized)
        switch (this.handle) {
          case MemeElementHandle.TOP_LEFT: {
            // Anchor is bottom-right, so position from anchor
            this.x = anchorX - this._width;
            this.y = anchorY - this._height;
            break;
          }
          case MemeElementHandle.TOP_RIGHT: {
            // Anchor is bottom-left, so x stays same, y from anchor
            this.x = anchorX;
            this.y = anchorY - this._height;
            break;
          }
          case MemeElementHandle.BOTTOM_LEFT: {
            // Anchor is top-right, so x from anchor, y stays same
            this.x = anchorX - this._width;
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

  // Method to mark size as user-set (called when size is set externally)
  public markSizeAsUserSet(): void {
    this._userHasSetSize = true;
  }
}

export default TextElement;

