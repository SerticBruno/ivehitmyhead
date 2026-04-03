import type MemeCanvasController from './MemeCanvasController';
import { scaled, svgToDataUrl } from '@/lib/utils/canvas';
import type MemeElement from './MemeElement';
import {
  getHandlePos,
  getHandleSize,
  getRotationHandleSize,
  MemeElementHandle,
} from './MemeElement';
import TextElement from './TextElement';

const HOVER_PREVIEW_ALPHA = 0.42;

const rotateSvg = svgToDataUrl(
  `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M2 14C2 14 2.12132 14.8492 5.63604 18.364C9.15076 21.8787 14.8492 21.8787 18.364 18.364C19.6092 17.1187 20.4133 15.5993 20.7762 14M2 14V20M2 14H8M22 10C22 10 21.8787 9.15076 18.364 5.63604C14.8492 2.12132 9.15076 2.12132 5.63604 5.63604C4.39076 6.88131 3.58669 8.40072 3.22383 10M22 10V4M22 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
 </svg>`
);

class MemeCanvasRenderer {
  private rotateImageSvg: HTMLImageElement;

  constructor(
    public controller: MemeCanvasController,
    public ctx: CanvasRenderingContext2D
  ) {
    const image = new Image();
    image.src = rotateSvg;
    this.rotateImageSvg = image;
  }

  public draw() {
    this.drawBackground();
    this.drawElements();
    if (this.controller.showCustomPhotoWatermark && !this.controller.exporting) {
      this.drawWatermark();
    }
    this.drawFramerate();
  }

  public drawWatermark() {
    const { ctx } = this;
    const canvas = ctx.canvas;
    const fontSize = scaled(canvas, 17);
    const paddingX = scaled(canvas, 6);
    const paddingY = scaled(canvas, 6);
    const strokeWidth = Math.max(2, scaled(canvas, 2.25));
    const text = 'ivehitmyhead.com';

    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.font = `${fontSize}px Outfit, sans-serif`;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    const x = paddingX;
    const y = canvas.height - paddingY;

    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);
  }

  private drawElementChrome(
    element: MemeElement,
    alpha: number,
    showHandles: boolean
  ) {
    const borderX = element.x;
    const borderY = element.y;
    const borderWidth = element.width;
    const borderHeight = element.height;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    if (element.rotation !== 0) {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate((element.rotation * Math.PI) / 180);
      this.ctx.translate(-centerX, -centerY);
    }
    this.ctx.strokeStyle = '#3b82f6';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(borderX, borderY, borderWidth, borderHeight);

    if (showHandles) {
      // Draw rotation handle on the element
      {
        const size = getRotationHandleSize(this.controller);
        const handleX = getHandlePos(element, MemeElementHandle.ROTATION_HANDLE);
        const x = handleX.x - size / 2;
        const y = handleX.y - size / 2;
        const iconWidth = size / 1.5;
        const iconHeight = size / 1.5;

        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        if (this.ctx.roundRect) {
          this.ctx.roundRect(x, y, size, size, size / 2);
        } else {
          this.ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        }
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.drawImage(
          this.rotateImageSvg,
          x + iconWidth / 4,
          y + iconHeight / 4,
          iconWidth,
          iconHeight
        );
      }

      // Draw resize handles around the element
      {
        const size = getHandleSize(this.controller);
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;

        for (const handle of [
          MemeElementHandle.TOP_LEFT,
          MemeElementHandle.TOP_RIGHT,
          MemeElementHandle.BOTTOM_LEFT,
          MemeElementHandle.BOTTOM_RIGHT,
        ]) {
          const pos = getHandlePos(element, handle);
          const hx = pos.x - size / 2;
          const hy = pos.y - size / 2;

          this.ctx.beginPath();
          if (this.ctx.roundRect) {
            this.ctx.roundRect(
              hx,
              hy,
              size,
              size,
              this.controller.isTouch ? size / 2 : 2
            );
          } else {
            this.ctx.rect(hx, hy, size, size);
          }
          this.ctx.fill();
          this.ctx.stroke();
        }
      }
    }

    this.ctx.restore();
  }

  private drawElements() {
    for (const element of this.controller.elements) {
      this.ctx.save();

      if (element.rotation !== 0) {
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate((element.rotation * Math.PI) / 180);
        this.ctx.translate(-centerX, -centerY);
      }

      element.draw();

      this.ctx.restore();

      if (
        !this.controller.exporting &&
        this.controller.selectedElements.includes(element)
      ) {
        const showHandles =
          !element.locked &&
          this.controller.holdingCtrl === false &&
          this.controller.selectedElements.length === 1;
        this.drawElementChrome(element, 1, showHandles);
      }
    }

    if (this.controller.exporting) return;

    const hover = this.controller.hoveredPreviewElement;
    if (
      hover instanceof TextElement &&
      !this.controller.selectedElements.includes(hover)
    ) {
      const showHandles =
        !hover.locked && this.controller.holdingCtrl === false;
      this.drawElementChrome(hover, HOVER_PREVIEW_ALPHA, showHandles);
    }
  }

  private drawBackground() {
    const image = this.controller.image;

    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    if (image !== null) {
      // Draw image at its original size, maintaining aspect ratio
      // Canvas dimensions match image dimensions exactly
      this.ctx.drawImage(
        image,
        this.controller.padding.left,
        this.controller.padding.top,
        this.ctx.canvas.width -
          this.controller.padding.right -
          this.controller.padding.left,
        this.ctx.canvas.height -
          this.controller.padding.bottom -
          this.controller.padding.top
      );
    }
  }

  private drawFramerate() {
    if (this.controller.debug && !this.controller.exporting) {
      this.ctx.font = '16px sans-serif';
      const text = `${this.controller.fps.toFixed(2)} fps`;
      this.ctx.strokeStyle = 'black';
      this.ctx.lineWidth = 2;
      this.ctx.strokeText(text, 4, 16);
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(text, 4, 16);
    }
  }
}

export default MemeCanvasRenderer;

