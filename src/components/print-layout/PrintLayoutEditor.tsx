'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { A4_PORTRAIT_PX, GUIDE_CORNER_RADIUS_PX, GUIDE_SIZES_MM, mmToPx } from '@/lib/printLayout/constants';

type LayoutSlot = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type ImageAsset = {
  id: string;
  src: string;
  name: string;
  width: number;
  height: number;
};

type SlotPlacement = {
  imageId?: string;
  scale: number;
  offsetX: number;
  offsetY: number;
  rotationDeg: number;
};

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

const GRID_GAP_MM = 0;
const EXPORT_FILE_NAME = 'a4-print-layout';

const slots: LayoutSlot[] = (() => {
  const gapPx = mmToPx(GRID_GAP_MM);
  const slotW = mmToPx(GUIDE_SIZES_MM.large.width);
  const slotH = mmToPx(GUIDE_SIZES_MM.large.height);
  const cols = 4;
  const rows = 4;
  const gridW = cols * slotW + (cols - 1) * gapPx;
  const gridH = rows * slotH + (rows - 1) * gapPx;
  const startX = Math.round((A4_PORTRAIT_PX.width - gridW) / 2);
  const startY = Math.round((A4_PORTRAIT_PX.height - gridH) / 2);

  const builtSlots: LayoutSlot[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const rowLabel = String.fromCharCode(65 + row);
      builtSlots.push({
        id: `${rowLabel}${col + 1}`,
        x: Math.round(startX + col * (slotW + gapPx)),
        y: Math.round(startY + row * (slotH + gapPx)),
        width: slotW,
        height: slotH,
      });
    }
  }
  return builtSlots;
})();

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function getImageCornerPercentages(
  slot: LayoutSlot,
  drawW: number,
  drawH: number,
  offsetX: number,
  offsetY: number,
  rotationDeg: number
): Record<ResizeHandle, { leftPct: number; topPct: number }> {
  const cx = slot.width / 2 + offsetX;
  const cy = slot.height / 2 + offsetY;
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const hw = drawW / 2;
  const hh = drawH / 2;

  const localCorners: Record<ResizeHandle, { x: number; y: number }> = {
    nw: { x: -hw, y: -hh },
    ne: { x: hw, y: -hh },
    sw: { x: -hw, y: hh },
    se: { x: hw, y: hh },
  };

  return (Object.keys(localCorners) as ResizeHandle[]).reduce(
    (acc, handle) => {
      const pt = localCorners[handle];
      const x = cx + pt.x * cos - pt.y * sin;
      const y = cy + pt.x * sin + pt.y * cos;
      acc[handle] = {
        leftPct: (x / slot.width) * 100,
        topPct: (y / slot.height) * 100,
      };
      return acc;
    },
    {} as Record<ResizeHandle, { leftPct: number; topPct: number }>
  );
}

export default function PrintLayoutEditor() {
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [placements, setPlacements] = useState<Record<string, SlotPlacement>>(
    Object.fromEntries(
      slots.map((slot) => [
        slot.id,
        {
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          rotationDeg: 0,
        },
      ])
    )
  );
  const [showGuides, setShowGuides] = useState(true);
  const [activeSlotId, setActiveSlotId] = useState<string>('');
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const dragState = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null);
  const resizeState = useRef<{
    centerX: number;
    centerY: number;
    startDistance: number;
    startScale: number;
  } | null>(null);

  const assetsById = useMemo(
    () => Object.fromEntries(assets.map((asset) => [asset.id, asset])),
    [assets]
  );
  const activePlacement = placements[activeSlotId];
  const activeSlot = slots.find((slot) => slot.id === activeSlotId);
  const targetSlotIds = selectedSlotIds.length > 0 ? selectedSlotIds : (activeSlotId ? [activeSlotId] : []);
  const assignedImageValue = (() => {
    if (targetSlotIds.length === 0) return '';
    const first = placements[targetSlotIds[0]]?.imageId ?? '';
    const allSame = targetSlotIds.every((id) => (placements[id]?.imageId ?? '') === first);
    return allSame ? first : '__mixed__';
  })();

  const assignImagesSequentially = (imageIds: string[]) => {
    setPlacements((prev) => {
      const next = { ...prev };
      const freeSlots = slots.filter((slot) => !next[slot.id]?.imageId);
      imageIds.forEach((imageId, index) => {
        const targetSlot = freeSlots[index];
        if (!targetSlot) return;
        next[targetSlot.id] = {
          ...next[targetSlot.id],
          imageId,
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          rotationDeg: 0,
        };
      });
      return next;
    });
  };

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const loaded = await Promise.all(
      files.map(
        (file) =>
          new Promise<ImageAsset>((resolve, reject) => {
            const src = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () =>
              resolve({
                id: `${file.name}-${crypto.randomUUID()}`,
                src,
                name: file.name,
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            img.onerror = () => reject(new Error(`Could not load image: ${file.name}`));
            img.src = src;
          })
      )
    );

    setAssets((prev) => [...prev, ...loaded]);
    assignImagesSequentially(loaded.map((item) => item.id));
    event.target.value = '';
  };

  const setPlacement = (slotId: string, patch: Partial<SlotPlacement>) => {
    setPlacements((prev) => ({
      ...prev,
      [slotId]: { ...prev[slotId], ...patch },
    }));
  };

  const onPickImageForSelection = (imageId: string) => {
    const ids = targetSlotIds;
    if (ids.length === 0) return;
    setPlacements((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = {
          ...next[id],
          imageId: imageId || undefined,
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          rotationDeg: 0,
        };
      });
      return next;
    });
  };

  const getContainScale = (asset: ImageAsset, slot: LayoutSlot) =>
    Math.min(slot.width / asset.width, slot.height / asset.height);

  const clampOffsetForSlot = (slot: LayoutSlot, placement: SlotPlacement) => {
    const asset = placement.imageId ? assetsById[placement.imageId] : undefined;
    if (!asset) return { offsetX: 0, offsetY: 0 };
    return {
      offsetX: placement.offsetX,
      offsetY: placement.offsetY,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const slotElement = target.closest('[data-slot-id]') as HTMLElement | null;
    const clickedSlotId = slotElement?.dataset.slotId;

    if (clickedSlotId && clickedSlotId !== activeSlotId) {
      setActiveSlotId(clickedSlotId);
      if (event.ctrlKey || event.metaKey) {
        setSelectedSlotIds((prev) =>
          prev.includes(clickedSlotId)
            ? prev.filter((id) => id !== clickedSlotId)
            : [...prev, clickedSlotId]
        );
      } else {
        setSelectedSlotIds([clickedSlotId]);
      }
      return;
    }

    if (clickedSlotId && clickedSlotId === activeSlotId && (event.ctrlKey || event.metaKey)) {
      setSelectedSlotIds((prev) =>
        prev.includes(clickedSlotId)
          ? prev.filter((id) => id !== clickedSlotId)
          : [...prev, clickedSlotId]
      );
      return;
    }

    if (event.target === event.currentTarget) {
      setActiveSlotId('');
      setSelectedSlotIds([]);
      return;
    }
    if (resizeState.current) return;
    if (!activeSlot) return;
    const placement = placements[activeSlot.id];
    if (!placement?.imageId) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragging(true);
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: placement.offsetX,
      startOffsetY: placement.offsetY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (resizeState.current && activeSlot) {
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;
      const previewScale = rect.width / A4_PORTRAIT_PX.width;
      if (previewScale <= 0) return;
      const pointerX = (event.clientX - rect.left) / previewScale;
      const pointerY = (event.clientY - rect.top) / previewScale;
      const dx = pointerX - resizeState.current.centerX;
      const dy = pointerY - resizeState.current.centerY;
      const currentDistance = Math.hypot(dx, dy);
      const ratio = currentDistance / Math.max(resizeState.current.startDistance, 1);
      const nextScale = clamp(resizeState.current.startScale * ratio, 0.2, 5);
      setPlacements((prev) => {
        const current = prev[activeSlot.id];
        if (!current) return prev;
        const nextPlacement = {
          ...current,
          scale: nextScale,
        };
        return {
          ...prev,
          [activeSlot.id]: {
            ...nextPlacement,
            ...clampOffsetForSlot(activeSlot, nextPlacement),
          },
        };
      });
      return;
    }

    if (!dragState.current || !activeSlot) return;
    const placement = placements[activeSlot.id];
    if (!placement) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const previewScale = rect.width / A4_PORTRAIT_PX.width;
    if (previewScale <= 0) return;
    const dx = (event.clientX - dragState.current.startX) / previewScale;
    const dy = (event.clientY - dragState.current.startY) / previewScale;
    const nextPlacement = {
      ...placement,
      offsetX: dragState.current.startOffsetX + dx,
      offsetY: dragState.current.startOffsetY + dy,
    };
    const clamped = clampOffsetForSlot(activeSlot, nextPlacement);
    setPlacement(activeSlot.id, clamped);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    setResizing(false);
    dragState.current = null;
    resizeState.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const exportPng = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = A4_PORTRAIT_PX.width;
    canvas.height = A4_PORTRAIT_PX.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const slot of slots) {
      const placement = placements[slot.id];
      if (!placement?.imageId) {
        continue;
      }
      const asset = assetsById[placement.imageId];
      if (!asset) continue;

      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Could not render image: ${asset.name}`));
        img.src = asset.src;
      });

      const clamped = clampOffsetForSlot(slot, placement);
      const containScale = getContainScale(asset, slot);
      const finalScale = containScale * placement.scale;
      const drawW = asset.width * finalScale;
      const drawH = asset.height * finalScale;
      const centerX = slot.x + slot.width / 2 + clamped.offsetX;
      const centerY = slot.y + slot.height / 2 + clamped.offsetY;

      ctx.save();
      roundedRectPath(ctx, slot.x, slot.y, slot.width, slot.height, GUIDE_CORNER_RADIUS_PX);
      ctx.clip();
      ctx.translate(centerX, centerY);
      ctx.rotate(((placement.rotationDeg ?? 0) * Math.PI) / 180);
      ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Always include the outer guide in exports.
      ctx.save();
      roundedRectPath(ctx, slot.x, slot.y, slot.width, slot.height, GUIDE_CORNER_RADIUS_PX);
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.restore();
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${EXPORT_FILE_NAME}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
      <aside className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-4">
        <h2 className="text-lg font-black uppercase tracking-wide mb-3">Print Controls</h2>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Upload images</label>
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => uploadInputRef.current?.click()}
            className="w-full rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
          >
            Choose images
          </Button>
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showGuides}
              onChange={(event) => setShowGuides(event.target.checked)}
              className="cursor-pointer"
            />
            Show guide borders
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Active slot</label>
          <select
            className="w-full border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-950 px-2 py-1.5 text-sm cursor-pointer"
            value={activeSlotId}
            onChange={(event) => {
              const value = event.target.value;
              setActiveSlotId(value);
              setSelectedSlotIds(value ? [value] : []);
            }}
          >
            <option value="">No slot selected</option>
            {slots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.id}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold">Target slots</label>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-xs font-semibold underline cursor-pointer"
                onClick={() => {
                  const all = slots.map((slot) => slot.id);
                  setSelectedSlotIds(all);
                  setActiveSlotId(all[0] ?? '');
                }}
              >
                Select all
              </button>
              <button
                type="button"
                className="text-xs font-semibold underline cursor-pointer"
                onClick={() => setSelectedSlotIds([])}
              >
                Clear
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1 border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-950 p-2">
            {slots.map((slot) => {
              const checked = selectedSlotIds.includes(slot.id);
              return (
                <label key={slot.id} className="inline-flex items-center gap-1 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      setSelectedSlotIds((prev) =>
                        isChecked ? [...prev, slot.id] : prev.filter((id) => id !== slot.id)
                      );
                      if (isChecked) {
                        setActiveSlotId(slot.id);
                      } else if (activeSlotId === slot.id) {
                        setActiveSlotId('');
                      }
                    }}
                    className="cursor-pointer"
                  />
                  {slot.id}
                </label>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Tip: Ctrl/Cmd+click slots on canvas to multi-select quickly.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={!activeSlotId || !activePlacement?.imageId || targetSlotIds.length === 0}
            onClick={() => {
              if (!activeSlotId) return;
              const source = placements[activeSlotId];
              if (!source?.imageId) return;
              setPlacements((prev) => {
                const next = { ...prev };
                targetSlotIds.forEach((id) => {
                  if (id === activeSlotId) return;
                  next[id] = {
                    ...next[id],
                    imageId: source.imageId,
                    scale: source.scale,
                    offsetX: source.offsetX,
                    offsetY: source.offsetY,
                    rotationDeg: source.rotationDeg,
                  };
                });
                return next;
              });
            }}
            className="mt-2 w-full rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
          >
            Copy active image setup to targets
          </Button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Assigned image</label>
          <select
            className="w-full border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-950 px-2 py-1.5 text-sm cursor-pointer"
            value={assignedImageValue}
            onChange={(event) => onPickImageForSelection(event.target.value)}
            disabled={targetSlotIds.length === 0}
          >
            <option value="__mixed__" disabled>
              Mixed selection
            </option>
            <option value="">No image</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            Zoom ({((activePlacement?.scale ?? 1) * 100).toFixed(0)}%)
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={activePlacement?.scale ?? 1}
            disabled={!activeSlotId}
            onChange={(event) =>
              setPlacements((prev) => {
                const slot = slots.find((item) => item.id === activeSlotId);
                const current = prev[activeSlotId];
                if (!slot || !current) return prev;
                const nextPlacement = {
                  ...current,
                  scale: Number(event.target.value),
                };
                return {
                  ...prev,
                  [activeSlotId]: {
                    ...nextPlacement,
                    ...clampOffsetForSlot(slot, nextPlacement),
                  },
                };
              })
            }
            className="w-full cursor-pointer"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            Rotation ({Math.round(activePlacement?.rotationDeg ?? 0)}deg)
          </label>
          <div className="flex gap-2 mb-2">
            <Button
              type="button"
              variant="outline"
              disabled={targetSlotIds.length === 0}
              onClick={() =>
                setPlacements((prev) => {
                  const ids = targetSlotIds;
                  if (ids.length === 0) return prev;
                  const next = { ...prev };
                  ids.forEach((id) => {
                    const slot = slots.find((item) => item.id === id);
                    const current = next[id];
                    if (!slot || !current) return;
                    const nextPlacement = {
                      ...current,
                      rotationDeg: ((current.rotationDeg + 90) % 360 + 360) % 360,
                    };
                    next[id] = {
                      ...nextPlacement,
                      ...clampOffsetForSlot(slot, nextPlacement),
                    };
                  });
                  return next;
                })
              }
              className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
            >
              Rotate +90deg
            </Button>
          </div>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={activePlacement?.rotationDeg ?? 0}
            disabled={!activeSlotId}
            onChange={(event) =>
              setPlacements((prev) => {
                const slot = slots.find((item) => item.id === activeSlotId);
                const current = prev[activeSlotId];
                if (!slot || !current) return prev;
                const nextPlacement = {
                  ...current,
                  rotationDeg: Number(event.target.value),
                };
                return {
                  ...prev,
                  [activeSlotId]: {
                    ...nextPlacement,
                    ...clampOffsetForSlot(slot, nextPlacement),
                  },
                };
              })
            }
            className="w-full cursor-pointer"
          />
        </div>

        <Button
          onClick={exportPng}
          className="w-full rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
        >
          Download A4 PNG
        </Button>
      </aside>

      <section className="border-2 border-zinc-700 dark:border-zinc-400 bg-zinc-100 dark:bg-gray-950 p-4 overflow-auto">
        <div
          ref={stageRef}
          className="relative mx-auto bg-white shadow-[8px_8px_0px_rgba(0,0,0,0.85)] select-none touch-none"
          style={{
            width: '100%',
            maxWidth: 900,
            aspectRatio: `${A4_PORTRAIT_PX.width} / ${A4_PORTRAIT_PX.height}`,
            cursor: resizing ? 'nwse-resize' : dragging ? 'grabbing' : 'default',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {slots.map((slot) => {
            const placement = placements[slot.id];
            const asset = placement?.imageId ? assetsById[placement.imageId] : undefined;
            const containScale = asset ? getContainScale(asset, slot) : 1;
            const finalScale = containScale * (placement?.scale ?? 1);
            const drawW = asset ? asset.width * finalScale : 0;
            const drawH = asset ? asset.height * finalScale : 0;
            const offsetX = placement?.offsetX ?? 0;
            const offsetY = placement?.offsetY ?? 0;
            const rotationDeg = placement?.rotationDeg ?? 0;
            const isActive = activeSlotId === slot.id;
            const altGuide = GUIDE_SIZES_MM.small;
            const altW = mmToPx(altGuide.width);
            const altH = mmToPx(altGuide.height);
            const altLeft = (slot.width - altW) / 2;
            const altTop = (slot.height - altH) / 2;
            const cornerPositions =
              asset && drawW > 0 && drawH > 0
                ? getImageCornerPercentages(slot, drawW, drawH, offsetX, offsetY, rotationDeg)
                : null;

            return (
              <button
                type="button"
                key={slot.id}
                onClick={() => setActiveSlotId(slot.id)}
                data-slot-id={slot.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${(slot.x / A4_PORTRAIT_PX.width) * 100}%`,
                  top: `${(slot.y / A4_PORTRAIT_PX.height) * 100}%`,
                  width: `${(slot.width / A4_PORTRAIT_PX.width) * 100}%`,
                  height: `${(slot.height / A4_PORTRAIT_PX.height) * 100}%`,
                  borderRadius: `${(GUIDE_CORNER_RADIUS_PX / slot.width) * 100}%`,
                  border: 'none',
                  boxShadow: isActive ? 'inset 0 0 0 3px #16a34a' : 'none',
                  background: '#fff',
                }}
              >
                {asset ? (
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{
                      borderRadius: `${(GUIDE_CORNER_RADIUS_PX / slot.width) * 100}%`,
                    }}
                  >
                    {/* Intentional raw img for freeform editor transforms and drag behavior */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.src}
                      alt={asset.name}
                      draggable={false}
                      className="absolute pointer-events-none max-w-none"
                      style={{
                        left: `${50 + (offsetX / slot.width) * 100}%`,
                        top: `${50 + (offsetY / slot.height) * 100}%`,
                        width: `${(drawW / slot.width) * 100}%`,
                        height: `${(drawH / slot.height) * 100}%`,
                        transform: `translate(-50%, -50%) rotate(${rotationDeg}deg)`,
                        transformOrigin: 'center center',
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center pointer-events-none">
                    <div className="rounded bg-white/85 px-2 py-1 text-[10px] text-zinc-700 text-center leading-tight">
                      <div className="font-bold">{slot.id}</div>
                      <div className="font-semibold">40x60mm</div>
                    </div>
                  </div>
                )}
                {showGuides ? (
                  <>
                    <div className="absolute left-1 bottom-1 z-10 pointer-events-none px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700">
                      50x70mm
                    </div>
                    <svg
                      className="absolute inset-0 pointer-events-none"
                      viewBox={`0 0 ${slot.width} ${slot.height}`}
                      preserveAspectRatio="none"
                    >
                      <rect
                        x="1"
                        y="1"
                        width={Math.max(slot.width - 2, 0)}
                        height={Math.max(slot.height - 2, 0)}
                        rx={GUIDE_CORNER_RADIUS_PX}
                        ry={GUIDE_CORNER_RADIUS_PX}
                        fill="none"
                        stroke="#ea580c"
                        strokeWidth="2"
                      />
                      <rect
                        x={altLeft}
                        y={altTop}
                        width={altW}
                        height={altH}
                        rx={GUIDE_CORNER_RADIUS_PX}
                        ry={GUIDE_CORNER_RADIUS_PX}
                        fill="none"
                        stroke="#1d4ed8"
                        strokeWidth="2"
                        strokeDasharray="44 22"
                      />
                    </svg>
                  </>
                ) : null}
                {isActive && asset ? (
                  (['nw', 'ne', 'sw', 'se'] as ResizeHandle[]).map((handle) => {
                    const corner = cornerPositions?.[handle];
                    return (
                      <span
                        key={handle}
                        role="presentation"
                        className="absolute z-20 h-4 w-4 bg-white border-2 border-zinc-900 rounded-sm"
                        style={{
                          left: corner ? `calc(${corner.leftPct}% - 8px)` : 'calc(50% - 8px)',
                          top: corner ? `calc(${corner.topPct}% - 8px)` : 'calc(50% - 8px)',
                          cursor: handle === 'nw' || handle === 'se' ? 'nwse-resize' : 'nesw-resize',
                        }}
                        onPointerDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          const rect = stageRef.current?.getBoundingClientRect();
                          if (!rect || !placement) return;
                          const previewScale = rect.width / A4_PORTRAIT_PX.width;
                          if (previewScale <= 0) return;
                          const pointerX = (event.clientX - rect.left) / previewScale;
                          const pointerY = (event.clientY - rect.top) / previewScale;
                          const centerX = slot.x + slot.width / 2 + (placement.offsetX ?? 0);
                          const centerY = slot.y + slot.height / 2 + (placement.offsetY ?? 0);
                          const startDistance = Math.hypot(pointerX - centerX, pointerY - centerY);
                          setResizing(true);
                          resizeState.current = {
                            centerX,
                            centerY,
                            startDistance,
                            startScale: placement?.scale ?? 1,
                          };
                          event.currentTarget.setPointerCapture(event.pointerId);
                        }}
                        onPointerUp={(event) => {
                          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                            event.currentTarget.releasePointerCapture(event.pointerId);
                          }
                        }}
                      />
                    );
                  })
                ) : null}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
