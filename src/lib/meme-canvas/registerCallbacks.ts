import type MemeCanvasController from './MemeCanvasController';
import TextElement from './TextElement';
import MathHelper from '@/lib/utils/math';

type UnregisterCallbacks = () => void;

function activeElementIsTextInput(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  ) {
    return true;
  }
  if (el instanceof HTMLElement) {
    if (el.isContentEditable) return true;
    if (el.closest('[contenteditable="true"]')) return true;
  }
  return false;
}

/** Percent of image (0–100), same basis as templates.ts + MemeCanvasRenderer overlay. */
function formatTextFieldLayoutForTemplate(
  controller: MemeCanvasController,
  element: TextElement
): string | null {
  const img = controller.image;
  if (!img || img.width <= 0 || img.height <= 0) return null;

  const pad = controller.padding;
  const pctX = ((element.x - pad.left) / img.width) * 100;
  const pctY = ((element.y - pad.top) / img.height) * 100;
  const pctW = (element.width / img.width) * 100;
  const pctH = (element.height / img.height) * 100;

  const fmt = (n: number) => {
    const v = Math.round(n * 100) / 100;
    return String(v);
  };

  return `x: ${fmt(pctX)},\ny: ${fmt(pctY)},\nwidth: ${fmt(pctW)},\nheight: ${fmt(pctH)},`;
}

type MouseEventSourceCapabilities = MouseEvent & {
  sourceCapabilities?: {
    firesTouchEvents?: boolean;
  };
};

/** True while the current touch gesture should use canvas handlers instead of native scroll (text hit or resize handle). */
function touchHitIsInteractive(
  controller: MemeCanvasController,
  x: number,
  y: number
): boolean {
  for (const element of controller.selectedElements) {
    if (element.handleAt(x, y) !== null) return true;
  }
  return controller.elementAt(x, y) !== null;
}

function readTouchCanvasCoords(
  controller: MemeCanvasController,
  event: TouchEvent
): { x: number; y: number } | null {
  const touch = event.touches[0] ?? event.changedTouches[0];
  if (touch === undefined) return null;

  const rect = controller.canvas.getBoundingClientRect();
  const displayWidth = rect.width;
  const displayHeight = rect.height;
  if (displayWidth <= 0 || displayHeight <= 0) return null;

  const mouseX = touch.clientX - rect.left;
  const mouseY = touch.clientY - rect.top;

  const scaleX = controller.canvas.width / displayWidth;
  const scaleY = controller.canvas.height / displayHeight;

  const x = MathHelper.clamp(
    Math.round(mouseX * scaleX),
    0,
    controller.canvas.width
  );
  const y = MathHelper.clamp(
    Math.round(mouseY * scaleY),
    0,
    controller.canvas.height
  );

  return { x, y };
}

export default function registerCallbacks(
  controller: MemeCanvasController
): UnregisterCallbacks {
  const TOUCH_DOUBLE_TAP_MS = 350;
  const TOUCH_DOUBLE_TAP_DISTANCE = 24; // in canvas coordinates
  let lastTouchTap: { time: number; x: number; y: number } | null = null;
  /** Set on touchstart; when false, touchmove/touchend do not block native page scroll. */
  let touchBlocksNativeScroll = false;

  /** Mouse down / up / dblclick: require primary button. */
  function mouseEvent(
    event: MouseEventSourceCapabilities,
    fn: (x: number, y: number) => void
  ) {
    if (event.sourceCapabilities?.firesTouchEvents === true) return;
    if (event.button !== 0) return;

    mouseEventCoords(event, fn);
  }

  /**
   * Mouse move: do not require `button === 0` - many browsers leave `button` unset or non-zero
   * while moving with no buttons pressed, which previously skipped all hover / hit-testing.
   */
  function mouseEventCoords(
    event: MouseEventSourceCapabilities,
    fn: (x: number, y: number) => void
  ) {
    if (event.sourceCapabilities?.firesTouchEvents === true) return;

    const rect = controller.canvas.getBoundingClientRect();
    const displayWidth = rect.width;
    const displayHeight = rect.height;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const scaleX = controller.canvas.width / displayWidth;
    const scaleY = controller.canvas.height / displayHeight;

    const x = MathHelper.clamp(
      Math.round(mouseX * scaleX),
      0,
      controller.canvas.width
    );
    const y = MathHelper.clamp(
      Math.round(mouseY * scaleY),
      0,
      controller.canvas.height
    );

    controller.isTouch = false;
    controller.requestFrame();
    fn.call(controller, x, y);
  }

  const callbacks = {
    dblclick: (e: MouseEvent) => mouseEvent(e, controller.onDoubleClick),
    touch: (e: TouchEvent) => {
      const coords = readTouchCanvasCoords(controller, e);
      if (coords === null) return;

      const { x, y } = coords;
      touchBlocksNativeScroll = touchHitIsInteractive(controller, x, y);

      controller.requestFrame();
      controller.isTouch = true;
      controller.mouseX = x;
      controller.mouseY = y;

      if (touchBlocksNativeScroll && e.cancelable === true) {
        e.preventDefault();
      }

      if (touchBlocksNativeScroll) {
        const now = Date.now();
        const last = lastTouchTap;
        const dx = last ? Math.abs(x - last.x) : Infinity;
        const dy = last ? Math.abs(y - last.y) : Infinity;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isDoubleTap =
          last !== null &&
          now - last.time < TOUCH_DOUBLE_TAP_MS &&
          dist < TOUCH_DOUBLE_TAP_DISTANCE;

        if (isDoubleTap) {
          lastTouchTap = null;
          controller.onDoubleClick(x, y);
          return;
        }

        lastTouchTap = { time: now, x, y };
      }

      controller.onPress(x, y);
    },
    touchrelease: (e: TouchEvent) => {
      const coords = readTouchCanvasCoords(controller, e);
      if (touchBlocksNativeScroll && e.cancelable === true) {
        e.preventDefault();
      }
      touchBlocksNativeScroll = false;

      const rx = coords?.x ?? controller.mouseX;
      const ry = coords?.y ?? controller.mouseY;
      if (Number.isFinite(rx) && Number.isFinite(ry)) {
        controller.onRelease(rx, ry);
      }
      controller.requestFrame();
    },
    touchmove: (e: TouchEvent) => {
      const coords = readTouchCanvasCoords(controller, e);
      if (coords === null) return;

      const { x, y } = coords;

      const blockScroll =
        touchBlocksNativeScroll ||
        controller.pendingDrag !== null ||
        controller.dragging === true ||
        controller.resizing === true;

      if (blockScroll && e.cancelable === true) {
        e.preventDefault();
      }

      controller.requestFrame();
      controller.mouseX = x;
      controller.mouseY = y;

      if (
        touchBlocksNativeScroll &&
        controller.pendingDrag &&
        !controller.dragging &&
        !controller.resizing
      ) {
        const pendingDrag = controller.pendingDrag;
        const dx = Math.abs(x - pendingDrag.x);
        const dy = Math.abs(y - pendingDrag.y);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= controller.TOUCH_DRAG_THRESHOLD) {
          controller.startDrag(pendingDrag.element, pendingDrag.x, pendingDrag.y);
          controller.pendingDrag = null;
        }
      }

      if (controller.dragging === true || controller.resizing === true) {
        controller.onDrag(x, y);
      }
    },
    touchcancel: () => {
      touchBlocksNativeScroll = false;
      if (
        Number.isFinite(controller.mouseX) &&
        Number.isFinite(controller.mouseY)
      ) {
        controller.onRelease(controller.mouseX, controller.mouseY);
      }
      controller.requestFrame();
    },
    press: (e: MouseEvent) => mouseEvent(e, controller.onPress),
    release: (e: MouseEvent) => mouseEvent(e, controller.onRelease),
    mousemove: (e: MouseEvent) =>
      mouseEventCoords(e, (x, y) => {
        controller.mouseX = x;
        controller.mouseY = y;
        
        // Check for pending drag and start it if threshold is met
        if (controller.pendingDrag && !controller.dragging && !controller.resizing) {
          const pendingDrag = controller.pendingDrag;
          const dx = Math.abs(x - pendingDrag.x);
          const dy = Math.abs(y - pendingDrag.y);
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance >= controller.DRAG_THRESHOLD) {
            // Start the drag now
            controller.startDrag(pendingDrag.element, pendingDrag.x, pendingDrag.y);
            controller.pendingDrag = null;
          }
        }
        
        // Hover preview (mouse only): unselected text fields show faint chrome
        if (
          !controller.exporting &&
          !controller.dragging &&
          !controller.resizing &&
          !controller.isTouch
        ) {
          const at = controller.elementAt(x, y);
          const nextHover =
            at instanceof TextElement &&
            !at.locked &&
            !controller.selectedElements.includes(at)
              ? at
              : null;
          if (controller.hoveredPreviewElement !== nextHover) {
            controller.hoveredPreviewElement = nextHover;
          }
        } else if (controller.hoveredPreviewElement !== null) {
          controller.hoveredPreviewElement = null;
        }

        // Update cursor based on what we're hovering over
        let cursor = 'default';
        if (controller.selectedElements.length === 1) {
          const element = controller.selectedElements[0];
          const handle = element.handleAt(x, y);
          if (handle !== null) {
            // Determine cursor based on handle type
            if (handle === 4) { // ROTATION_HANDLE
              cursor = 'grab';
            } else {
              // Resize handles
              const handles = [
                'nw-resize', // TOP_LEFT
                'ne-resize', // TOP_RIGHT
                'sw-resize', // BOTTOM_LEFT
                'se-resize', // BOTTOM_RIGHT
              ];
              cursor = handles[handle] || 'move';
            }
          } else if (element.intersects(x, y)) {
            cursor = 'move';
          }
        }

        if (
          cursor === 'default' &&
          !controller.exporting &&
          !controller.dragging &&
          !controller.resizing &&
          !controller.isTouch
        ) {
          const at = controller.elementAt(x, y);
          if (
            at instanceof TextElement &&
            !at.locked &&
            !controller.selectedElements.includes(at)
          ) {
            cursor = 'pointer';
          }
        }

        controller.canvas.style.cursor = cursor;
        
        if (controller.dragging === true || controller.resizing === true)
          controller.onDrag(x, y);
      }),
    keydown: (e: KeyboardEvent) => {
      controller.holdingShift = e.shiftKey;
      controller.holdingCtrl = e.ctrlKey;

      const wantsCopy =
        (e.key === 'c' || e.key === 'C') && (e.ctrlKey || e.metaKey);
      if (!wantsCopy || activeElementIsTextInput()) return;

      if (controller.selectedElements.length !== 1) return;
      const selected = controller.selectedElements[0];
      if (!(selected instanceof TextElement)) return;

      const layout = formatTextFieldLayoutForTemplate(controller, selected);
      if (layout === null) return;

      e.preventDefault();
      void navigator.clipboard.writeText(layout).catch(() => {});
    },
    keyup: (e: KeyboardEvent) => {
      controller.holdingShift = e.shiftKey;
      controller.holdingCtrl = e.ctrlKey;
    },
    mouseleave: () => {
      controller.hoveredPreviewElement = null;
      controller.requestFrame();
      controller.canvas.style.cursor = 'default';
    },
  };

  controller.canvas.addEventListener('dblclick', callbacks.dblclick);
  controller.canvas.addEventListener('mousedown', callbacks.press);
  controller.canvas.addEventListener('mouseleave', callbacks.mouseleave);
  document.addEventListener('mouseup', callbacks.release);
  document.addEventListener('mousemove', callbacks.mousemove);
  controller.canvas.addEventListener('touchstart', callbacks.touch, {
    passive: false,
  });
  controller.canvas.addEventListener('touchend', callbacks.touchrelease, {
    passive: false,
  });
  controller.canvas.addEventListener('touchmove', callbacks.touchmove, {
    passive: false,
  });
  controller.canvas.addEventListener('touchcancel', callbacks.touchcancel);
  document.addEventListener('keydown', callbacks.keydown);
  document.addEventListener('keyup', callbacks.keyup);

  return () => {
    controller.canvas.removeEventListener('dblclick', callbacks.dblclick);
    controller.canvas.removeEventListener('mousedown', callbacks.press);
    controller.canvas.removeEventListener('mouseleave', callbacks.mouseleave);
    document.removeEventListener('mouseup', callbacks.release);
    document.removeEventListener('mousemove', callbacks.mousemove);
    document.removeEventListener('keydown', callbacks.keydown);
    document.removeEventListener('keyup', callbacks.keyup);
    controller.canvas.removeEventListener('touchstart', callbacks.touch);
    controller.canvas.removeEventListener('touchend', callbacks.touchrelease);
    controller.canvas.removeEventListener('touchmove', callbacks.touchmove);
    controller.canvas.removeEventListener('touchcancel', callbacks.touchcancel);
    touchBlocksNativeScroll = false;
  };
}

