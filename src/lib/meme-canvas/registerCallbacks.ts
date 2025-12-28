import type MemeCanvasController from './MemeCanvasController';
import MathHelper from '@/lib/utils/math';

type UnregisterCallbacks = () => void;

type MouseEventSourceCapabilities = MouseEvent & {
  sourceCapabilities?: {
    firesTouchEvents?: boolean;
  };
};

export default function registerCallbacks(
  controller: MemeCanvasController
): UnregisterCallbacks {
  function mouseEvent(
    event: MouseEventSourceCapabilities,
    fn: (x: number, y: number) => void
  ) {
    if (event.sourceCapabilities?.firesTouchEvents === true) return;
    if (event.button !== 0) return;

    controller.requestFrame();

    const rect = controller.canvas.getBoundingClientRect();
    // Get the actual displayed size (accounting for CSS scaling)
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    
    // Calculate position relative to canvas element
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Calculate scale factor between display size and internal canvas size
    const scaleX = controller.canvas.width / displayWidth;
    const scaleY = controller.canvas.height / displayHeight;

    // Convert display coordinates to canvas coordinates
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
    fn.call(controller, x, y);
  }

  function touchEvent(
    event: TouchEvent,
    fn: (x: number, y: number) => void
  ) {
    if (event.changedTouches.length === 0) return;

    controller.requestFrame();

    const touch = event.touches[0] || event.changedTouches[0];
    if (touch === undefined) return;

    if (event.cancelable !== true) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    const rect = controller.canvas.getBoundingClientRect();
    // Get the actual displayed size (accounting for CSS scaling)
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    
    // Calculate position relative to canvas element
    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;
    
    // Calculate scale factor between display size and internal canvas size
    const scaleX = controller.canvas.width / displayWidth;
    const scaleY = controller.canvas.height / displayHeight;

    // Convert display coordinates to canvas coordinates
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

    controller.isTouch = true;
    controller.mouseX = x;
    controller.mouseY = y;
    fn.call(controller, x, y);
  }

  const callbacks = {
    dblclick: (e: MouseEvent) => mouseEvent(e, controller.onDoubleClick),
    touch: (e: TouchEvent) => touchEvent(e, controller.onPress),
    touchrelease: (e: TouchEvent) => touchEvent(e, controller.onRelease),
    touchmove: (e: TouchEvent) =>
      touchEvent(e, (x, y) => {
        controller.mouseX = x;
        controller.mouseY = y;
        
        // Check for pending drag and start it if threshold is met (for touch)
        if (controller.pendingDrag && !controller.dragging && !controller.resizing) {
          const pendingDrag = controller.pendingDrag;
          const dx = Math.abs(x - pendingDrag.x);
          const dy = Math.abs(y - pendingDrag.y);
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance >= controller.TOUCH_DRAG_THRESHOLD) {
            // Start the drag now
            controller.startDrag(pendingDrag.element, pendingDrag.x, pendingDrag.y);
            controller.pendingDrag = null;
          }
        }
        
        if (controller.dragging === true || controller.resizing === true)
          controller.onDrag(x, y);
      }),
    press: (e: MouseEvent) => mouseEvent(e, controller.onPress),
    release: (e: MouseEvent) => mouseEvent(e, controller.onRelease),
    mousemove: (e: MouseEvent) =>
      mouseEvent(e, (x, y) => {
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
        } else if (controller.selecting) {
          cursor = 'crosshair';
        }
        controller.canvas.style.cursor = cursor;
        
        if (controller.dragging === true || controller.resizing === true)
          controller.onDrag(x, y);
      }),
    keydown: (e: KeyboardEvent) => {
      controller.holdingShift = e.shiftKey;
      controller.holdingCtrl = e.ctrlKey;
    },
    keyup: (e: KeyboardEvent) => {
      controller.holdingShift = e.shiftKey;
      controller.holdingCtrl = e.ctrlKey;
    },
    mouseleave: () => {
      controller.canvas.style.cursor = 'default';
    },
  };

  controller.canvas.addEventListener('dblclick', callbacks.dblclick);
  controller.canvas.addEventListener('mousedown', callbacks.press);
  controller.canvas.addEventListener('mouseleave', callbacks.mouseleave);
  document.addEventListener('mouseup', callbacks.release);
  document.addEventListener('mousemove', callbacks.mousemove);
  controller.canvas.addEventListener('touchstart', callbacks.touch);
  controller.canvas.addEventListener('touchend', callbacks.touchrelease);
  controller.canvas.addEventListener('touchmove', callbacks.touchmove);
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
  };
}

