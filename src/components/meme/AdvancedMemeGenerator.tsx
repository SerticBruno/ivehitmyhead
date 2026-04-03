'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import MemeCanvasController from '@/lib/meme-canvas/MemeCanvasController';
import TextElement from '@/lib/meme-canvas/TextElement';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Download, Plus, Trash2, Type, ChevronDown, Upload } from 'lucide-react';
import {
  MEME_TEMPLATES,
  CUSTOM_PHOTO_TEMPLATE_ID,
  createCustomPhotoMemeTemplate,
} from '@/lib/data/templates';
import type { MemeTemplate } from '@/lib/types/meme';
import { useNavigationWarning } from '@/lib/contexts/NavigationWarningContext';

const PREVIEW_SCROLL_GAP_BELOW_HEADER_PX = 24;

/** After a template loads, align the preview below the sticky header and move focus for keyboard / assistive tech. */
function scrollMemePreviewIntoView(el: HTMLElement | null) {
  if (typeof window === 'undefined' || !el) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const header = document.querySelector('header');
      const headerHeight =
        header instanceof HTMLElement
          ? Math.ceil(header.getBoundingClientRect().height)
          : 64;
      const rect = el.getBoundingClientRect();
      const y =
        rect.top +
        window.scrollY -
        headerHeight -
        PREVIEW_SCROLL_GAP_BELOW_HEADER_PX;
      window.scrollTo({ top: Math.max(0, y), behavior: 'auto' });
      el.focus({ preventScroll: true });
    });
  });
}

interface AdvancedMemeGeneratorProps {
  templates?: MemeTemplate[];
}

function TemplatePreviewImage({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  if (src.startsWith('blob:')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- next/image does not support blob: URLs
      <img src={src} alt={alt} width={width} height={height} className={className} />
    );
  }
  return (
    <Image src={src} alt={alt} width={width} height={height} className={className} />
  );
}

export const AdvancedMemeGenerator: React.FC<AdvancedMemeGeneratorProps> = ({
  templates = MEME_TEMPLATES,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<MemeCanvasController | null>(null);
  const unregisterRef = useRef<(() => void) | null>(null);
  /** Invalidates in-flight loads when a new template is chosen or the component unmounts (avoids stuck “loading” and stale updates). */
  const templateLoadGenRef = useRef(0);
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(
    null
  );
  const [textInput, setTextInput] = useState('');
  const [selectedElement, setSelectedElement] = useState<TextElement | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [allTextElements, setAllTextElements] = useState<TextElement[]>([]);
  const [expandedElements, setExpandedElements] = useState<Set<number>>(new Set());
  const [elementTextInputs, setElementTextInputs] = useState<Record<number, string>>({});
  const [initialTemplateState, setInitialTemplateState] = useState<string>('');
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const { setDirty: setNavigationDirty } = useNavigationWarning();
  const [containerHeight, setContainerHeight] = useState('100vh');
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [editingTextIndex, setEditingTextIndex] = useState<number | null>(null);
  const textAreaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const editingElementRef = useRef<TextElement | null>(null);
  const customPhotoObjectUrlRef = useRef<string | null>(null);
  const customPhotoFileInputRef = useRef<HTMLInputElement>(null);

  const revokeCustomPhotoIfAny = useCallback(() => {
    if (customPhotoObjectUrlRef.current) {
      URL.revokeObjectURL(customPhotoObjectUrlRef.current);
      customPhotoObjectUrlRef.current = null;
    }
  }, []);

  useEffect(() => () => revokeCustomPhotoIfAny(), [revokeCustomPhotoIfAny]);

  useEffect(
    () => () => {
      templateLoadGenRef.current += 1;
    },
    []
  );

  const stopEditing = useCallback(() => {
    editingElementRef.current = null;
    setEditingTextIndex(null);
  }, []);

  const generatorRootRef = useRef<HTMLDivElement>(null);
  const memePreviewContainerRef = useRef<HTMLDivElement>(null);

  /** Clicks outside the canvas should blur sidebar fields and clear canvas selection (except on interactive controls). */
  useEffect(() => {
    const isLikelyInteractive = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      return Boolean(
        target.closest(
          'button, a[href], input, textarea, select, label, [role="button"], [role="tab"]'
        )
      );
    };

    const onPointerDownCapture = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const canvas = canvasRef.current;
      const root = generatorRootRef.current;
      const target = e.target;
      if (!canvas || !(target instanceof Node)) return;
      if (canvas.contains(target)) return;

      // Let the browser move focus between sidebar fields without double-clearing state.
      if (
        root?.contains(target) &&
        (target instanceof HTMLTextAreaElement ||
          target instanceof HTMLInputElement ||
          target instanceof HTMLSelectElement)
      ) {
        return;
      }

      const ae = document.activeElement;
      if (
        (ae instanceof HTMLTextAreaElement ||
          ae instanceof HTMLInputElement ||
          ae instanceof HTMLSelectElement) &&
        root?.contains(ae)
      ) {
        ae.blur();
      }
      stopEditing();

      if (!root?.contains(target)) return;
      if (!isLikelyInteractive(target)) {
        controllerRef.current?.clearSelected();
      }
    };

    document.addEventListener('pointerdown', onPointerDownCapture, true);
    return () =>
      document.removeEventListener('pointerdown', onPointerDownCapture, true);
  }, [stopEditing]);
  const focusAndSelectTextAreaAtIndex = useCallback((index: number) => {
    requestAnimationFrame(() => {
      const ta = textAreaRefs.current[index];
      if (!ta) return;
      ta.focus();
      ta.select();
      // Prevent internal scrollbars; grow to fit content.
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    });
  }, []);

  // Calculate container height based on viewport and screen size
  useEffect(() => {
    const updateHeight = () => {
      if (typeof window !== 'undefined') {
        // Treat tablets like mobile for layout/scroll behavior.
        const isMobile = window.innerWidth < 1024;
        setIsMobileViewport(isMobile);

        // On desktop, account for header (64px = 4rem)
        // On mobile, let content size naturally so we avoid nested scroll areas.
        setContainerHeight(isMobile ? 'auto' : 'calc(100vh - 4rem)');
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Initialize canvas - re-run when canvas becomes available
  useEffect(() => {
    if (!canvasRef.current) return;
    if (controllerRef.current) return; // Already initialized

    const controller = new MemeCanvasController();
    const unregister = controller.init(canvasRef.current);
    controllerRef.current = controller;
    unregisterRef.current = unregister;

    // Listen for input focus requests
    controller.listen('inputFocusRequest', (data) => {
      if (data.inputName === 'text') {
        const selected = controller.selectedElements[0];
        if (selected && selected instanceof TextElement) {
          setSelectedElement(selected);
          setTextInput(selected.settings.text.value);
          setShowTextInput(true);

          // Open the matching sidebar field for editing (from canvas double-click / double-tap).
          const elements = controller.elements.filter(
            (e) => e instanceof TextElement
          ) as TextElement[];
          const index = elements.indexOf(selected);
          if (index !== -1) {
            editingElementRef.current = selected;
            setEditingTextIndex(index);
            focusAndSelectTextAreaAtIndex(index);
          }
        }
      }
    });

    // Listen for selection changes
    controller.listen('selectedElementsChange', () => {
      const selected = controller.selectedElements[0];
      if (selected && selected instanceof TextElement) {
        setSelectedElement(selected);
        setTextInput(selected.settings.text.value);
        setShowTextInput(true);
      } else {
        setSelectedElement(null);
        setShowTextInput(false);
      }

      // If selection moved away from the element being edited, exit edit mode.
      if (editingElementRef.current && selected !== editingElementRef.current) {
        stopEditing();
      }
      // Update text elements list
      const elements = controller.elements.filter(
        (e) => e instanceof TextElement
      ) as TextElement[];
      setAllTextElements(elements);
    });

    // Listen for elements list changes to update sidebar
    controller.listen('elementsListChanged', () => {
      stopEditing();
      const elements = controller.elements.filter(
        (e) => e instanceof TextElement
      ) as TextElement[];
      setAllTextElements(elements);
      // Initialize text inputs for new elements
      const newInputs: Record<number, string> = {};
      elements.forEach((el, idx) => {
        newInputs[idx] = el.settings.text.value || '';
      });
      setElementTextInputs(newInputs);
      // Clean up expanded state for indices that no longer exist
      setExpandedElements(prev => {
        const cleaned = new Set<number>();
        prev.forEach(idx => {
          if (idx < elements.length) {
            cleaned.add(idx);
          }
        });
        return cleaned;
      });
    });

    // Listen for element updates to keep UI in sync
    controller.listen('elementsUpdated', () => {
      // Update selected element reference if it's still selected
      const selected = controller.selectedElements[0];
      if (selected && selected instanceof TextElement) {
        setSelectedElement(selected);
        setTextInput(selected.settings.text.value);
      }
      // Sync text inputs with element values
      const elements = controller.elements.filter(
        (e) => e instanceof TextElement
      ) as TextElement[];
      const updatedInputs: Record<number, string> = {};
      elements.forEach((el, idx) => {
        updatedInputs[idx] = el.settings.text.value || '';
      });
      setElementTextInputs(prev => ({ ...prev, ...updatedInputs }));
    });

    // Handle window resize to recalculate canvas size
    const handleResize = () => {
      if (controller.image) {
        controller.resize(controller.image.width, controller.image.height);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      unregister();
      controllerRef.current = null;
      unregisterRef.current = null;
      window.removeEventListener('resize', handleResize);
    };
  }, [stopEditing, focusAndSelectTextAreaAtIndex]);

  // Helper to check if actually dirty by comparing states
  const checkIfActuallyDirty = useCallback(() => {
    if (!selectedTemplate || !controllerRef.current || !initialTemplateState || isLoadingTemplate) {
      return false;
    }
    
    const elements = controllerRef.current.elements.filter(
      (e) => e instanceof TextElement
    ) as TextElement[];
    const currentState = JSON.stringify({
      templateId: selectedTemplate.id,
      elements: elements.map(el => ({
        text: el.settings.text.value,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        fontSize: el.settings.font_size,
        fontFamily: el.settings.font_family,
        color: el.settings.color,
        stroke: el.settings.stroke,
        strokeWidth: el.settings.stroke_width,
        alignment: el.settings.horizontal_align.current
      }))
    });
    return currentState !== initialTemplateState;
  }, [selectedTemplate, initialTemplateState, isLoadingTemplate]);

  // Helper to mark as dirty
  const markDirty = useCallback(() => {
    // Don't mark as dirty during template loading or if we don't have an initial state
    if (isLoadingTemplate || !initialTemplateState) {
      setNavigationDirty(false);
      return;
    }
    
    const actuallyDirty = checkIfActuallyDirty();
    setNavigationDirty(actuallyDirty);
  }, [checkIfActuallyDirty, setNavigationDirty, isLoadingTemplate, initialTemplateState]);

  // Mark as dirty when elements are updated
  useEffect(() => {
    if (!controllerRef.current || !selectedTemplate) return;

    const handleElementsUpdated = () => {
      // Use a small delay to ensure all updates are complete before checking
      setTimeout(() => {
        markDirty();
      }, 50);
    };

    controllerRef.current.listen('elementsUpdated', handleElementsUpdated);
  }, [markDirty, selectedTemplate]);

  // Also verify and sync navigation dirty state when template or loading state changes
  useEffect(() => {
    if (!selectedTemplate || isLoadingTemplate) {
      setNavigationDirty(false);
      return;
    }

    // Verify actual state and sync navigation dirty
    const actuallyDirty = checkIfActuallyDirty();
    setNavigationDirty(actuallyDirty);
  }, [selectedTemplate, isLoadingTemplate, checkIfActuallyDirty, setNavigationDirty]);

  // Check if user has unsaved changes and confirm before proceeding
  const checkDirtyAndProceed = useCallback((action: () => void) => {
    // Don't check if we're currently loading a template
    if (isLoadingTemplate) {
      action();
      return true;
    }

    // Actually verify if there are changes by comparing states
    const actuallyDirty = checkIfActuallyDirty();

    if (actuallyDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to proceed? Your changes will be lost.'
      );
      if (!confirmed) {
        return false;
      }
    }
    action();
    return true;
  }, [checkIfActuallyDirty, isLoadingTemplate]);

  // Load template image and create text elements from template
  const loadTemplate = useCallback(
    (template: MemeTemplate, skipConfirm = false) => {
      // Check for unsaved changes unless explicitly skipping confirmation
      if (!skipConfirm && !checkDirtyAndProceed(() => {})) {
        return;
      }

      if (template.id !== CUSTOM_PHOTO_TEMPLATE_ID) {
        revokeCustomPhotoIfAny();
      }

      // Immediately reset dirty state when starting to load a new template
      setNavigationDirty(false);
      templateLoadGenRef.current += 1;
      const loadGen = templateLoadGenRef.current;
      setIsLoadingTemplate(true);

      const finalizeTemplateLoad = (
        tmpl: MemeTemplate,
        elements: TextElement[]
      ) => {
        if (loadGen !== templateLoadGenRef.current) return;
        const newInputs: Record<number, string> = {};
        elements.forEach((el, idx) => {
          newInputs[idx] = el.settings.text.value || '';
        });
        setElementTextInputs(newInputs);
        setInitialTemplateState(
          JSON.stringify({
            templateId: tmpl.id,
            elements: elements.map((el) => ({
              text: el.settings.text.value,
              x: el.x,
              y: el.y,
              width: el.width,
              height: el.height,
              fontSize: el.settings.font_size,
              fontFamily: el.settings.font_family,
              color: el.settings.color,
              stroke: el.settings.stroke,
              strokeWidth: el.settings.stroke_width,
              alignment: el.settings.horizontal_align.current,
            })),
          })
        );
        scrollMemePreviewIntoView(memePreviewContainerRef.current);
        setIsLoadingTemplate(false);
      };

      // Helper function to actually load the template
      const doLoadTemplate = () => {
        if (loadGen !== templateLoadGenRef.current) return;
        if (!controllerRef.current) {
          console.warn('Canvas controller not initialized yet, retrying...');
          setTimeout(doLoadTemplate, 100);
          return;
        }

        const img = new window.Image();
        const src = template.src;
        if (src.startsWith('http://') || src.startsWith('https://')) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
          if (loadGen !== templateLoadGenRef.current) return;
          const ctrl = controllerRef.current;
          if (!ctrl) {
            if (loadGen === templateLoadGenRef.current) {
              setIsLoadingTemplate(false);
            }
            return;
          }

          ctrl.changeImage(img);
          setSelectedTemplate(template);
          setNavigationDirty(false);

          const textFields = template.textFields ?? [];
          const afterLayout = () => {
            if (loadGen !== templateLoadGenRef.current) return;
            const c2 = controllerRef.current;
            if (!c2) {
              if (loadGen === templateLoadGenRef.current) {
                setIsLoadingTemplate(false);
              }
              return;
            }

            if (textFields.length === 0) {
              c2.emit('elementsListChanged');
              c2.requestFrame();
              finalizeTemplateLoad(template, []);
              return;
            }

            const { canvas } = c2;
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            textFields.forEach((field, fieldIndex: number) => {
              if (loadGen !== templateLoadGenRef.current) return;
              if (!controllerRef.current) return;
              const x = (field.x / 100) * canvasWidth;
              const y = (field.y / 100) * canvasHeight;
              const width = (field.width / 100) * canvasWidth;
              const height = (field.height / 100) * canvasHeight;
              const fontSize = field.fontSize * (canvasHeight / 600);

              const textElement = new TextElement(controllerRef.current);

              textElement.width = Math.max(Math.round(width), 50);
              textElement.height = Math.max(Math.round(height), 30);
              textElement.markSizeAsUserSet();

              textElement.x = Math.round(x);
              textElement.y = Math.round(y);

              const placeholderText = `Text ${fieldIndex + 1}`;

              controllerRef.current.updateElement(textElement, 'text', {
                value: placeholderText,
                multiline: true,
              });

              controllerRef.current.updateElement(
                textElement,
                'font_family',
                field.fontFamily || template.defaultFont || 'Impact'
              );
              controllerRef.current.updateElement(
                textElement,
                'font_size',
                fontSize
              );
              controllerRef.current.updateElement(
                textElement,
                'color',
                field.color || template.defaultColor || '#ffffff'
              );
              controllerRef.current.updateElement(
                textElement,
                'stroke',
                field.strokeColor || '#000000'
              );
              controllerRef.current.updateElement(
                textElement,
                'stroke_width',
                (field.strokeWidth ?? 6) * (canvasHeight / 600)
              );
              if (field.useShadow !== undefined) {
                controllerRef.current.updateElement(
                  textElement,
                  'use_shadow',
                  field.useShadow
                );
                controllerRef.current.updateElement(
                  textElement,
                  'shadow_color',
                  field.shadowColor || '#000000'
                );
                controllerRef.current.updateElement(
                  textElement,
                  'shadow_blur',
                  (field.shadowBlur ?? 10) * (canvasHeight / 600)
                );
                controllerRef.current.updateElement(
                  textElement,
                  'shadow_offset_x',
                  (field.shadowOffsetX ?? 2) * (canvasHeight / 600)
                );
                controllerRef.current.updateElement(
                  textElement,
                  'shadow_offset_y',
                  (field.shadowOffsetY ?? 2) * (canvasHeight / 600)
                );
              }

              if (field.textAlign) {
                const alignMap: Record<string, 'left' | 'center' | 'right'> = {
                  left: 'left',
                  center: 'center',
                  right: 'right',
                };
                controllerRef.current.updateElement(textElement, 'horizontal_align', {
                  valid: ['left', 'center', 'right'] as const,
                  current: alignMap[field.textAlign] || 'center',
                });
              }

              if (field.rotation) {
                textElement.rotation = field.rotation;
              }

              controllerRef.current.addElement(textElement);
            });

            if (loadGen !== templateLoadGenRef.current) return;
            c2.emit('elementsListChanged');
            c2.requestFrame();

            const elements = c2.elements.filter(
              (e) => e instanceof TextElement
            ) as TextElement[];
            finalizeTemplateLoad(template, elements);
          };

          // Two rAFs: let layout / canvas backing size settle after changeImage + resize
          requestAnimationFrame(() => {
            requestAnimationFrame(afterLayout);
          });
        };
        img.onerror = () => {
          if (loadGen !== templateLoadGenRef.current) return;
          console.error('Failed to load template image:', template.src);
          if (template.id === CUSTOM_PHOTO_TEMPLATE_ID) {
            revokeCustomPhotoIfAny();
          }
          setIsLoadingTemplate(false);
        };
        img.src = src;
      };
      
      doLoadTemplate();
    },
    [checkDirtyAndProceed, setNavigationDirty, revokeCustomPhotoIfAny]
  );

  const loadCustomPhotoFromFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 10 * 1024 * 1024) {
        window.alert('Please choose an image under 10MB.');
        return;
      }
      if (!checkDirtyAndProceed(() => {})) return;
      revokeCustomPhotoIfAny();
      const objectUrl = URL.createObjectURL(file);
      customPhotoObjectUrlRef.current = objectUrl;
      loadTemplate(createCustomPhotoMemeTemplate(objectUrl), true);
    },
    [checkDirtyAndProceed, loadTemplate, revokeCustomPhotoIfAny]
  );

  // Add text element
  const addText = useCallback(() => {
    if (!controllerRef.current) return;

    controllerRef.current.createElement(TextElement);
  }, []);

  // Update text
  const updateText = useCallback(() => {
    if (!controllerRef.current || !selectedElement) return;

    if (selectedElement instanceof TextElement) {
      controllerRef.current.updateElement(selectedElement, 'text', {
        value: textInput,
        multiline: true,
      });
    }
  }, [selectedElement, textInput]);

  // Delete selected element
  const deleteSelected = useCallback(() => {
    if (!controllerRef.current) return;

    const selected = controllerRef.current.selectedElements;
    if (selected.length > 0) {
      controllerRef.current.removeElements(selected);
      setSelectedElement(null);
      setShowTextInput(false);
    }
  }, []);

  // Download meme (custom uploads include site watermark in file)
  const downloadMeme = useCallback(() => {
    if (!controllerRef.current) return;

    const name = selectedTemplate?.name || 'meme';
    const includeWatermark =
      selectedTemplate?.id === CUSTOM_PHOTO_TEMPLATE_ID;
    controllerRef.current.export(name, 'png', includeWatermark);
  }, [selectedTemplate]);

  // Keep canvas preview watermark in sync with template (custom photo only)
  useEffect(() => {
    const c = controllerRef.current;
    if (!c) return;
    c.showCustomPhotoWatermark =
      selectedTemplate?.id === CUSTOM_PHOTO_TEMPLATE_ID;
    c.requestFrame();
  }, [selectedTemplate?.id]);

  // Handle text input change
  useEffect(() => {
    if (selectedElement && showTextInput) {
      updateText();
    }
  }, [textInput, selectedElement, showTextInput, updateText]);

  return (
    <div
      ref={generatorRootRef}
      className="max-w-7xl mx-auto p-2 md:p-4 [&_button]:rounded-none [&_input]:rounded-none [&_select]:rounded-none [&_textarea]:rounded-none"
      style={{
        height: isMobileViewport ? 'auto' : containerHeight,
        maxHeight: isMobileViewport ? 'none' : containerHeight,
        overflow: isMobileViewport ? 'visible' : 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="text-center mb-3 md:mb-4 flex-shrink-0">
        <h1 className="text-xl md:text-2xl lg:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-1 md:mb-2">
          Meme generator
        </h1>
        <p className="text-xs md:text-sm lg:text-base text-gray-600 dark:text-gray-400">
          Template, upload, type. Export before you overthink the caption.
        </p>
      </div>

      <input
        ref={customPhotoFileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="sr-only"
        aria-label="Upload your own meme image"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) loadCustomPhotoFromFile(f);
        }}
      />

      <div
        className="flex flex-col lg:flex-row gap-2 md:gap-4 flex-1 min-h-0"
        style={{ flex: '1 1 0%', minHeight: 0, overflow: isMobileViewport ? 'visible' : 'hidden' }}
      >
        {/* Template chooser - shown first on mobile, part of right panel on desktop */}
        <div className="flex flex-col min-h-0 lg:hidden order-1 pb-6" style={{ minWidth: 0, maxWidth: '100%' }}>
          <div className="bg-white dark:bg-gray-900 rounded-none shadow-[8px_8px_0px_rgba(0,0,0,0.88)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] p-2 md:p-4 border-2 border-zinc-700 dark:border-zinc-400">
            <h2 className="text-base md:text-lg font-black uppercase tracking-tight mb-2 md:mb-4">Templates</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-2 mb-3"
              onClick={() => customPhotoFileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Upload your photo
            </Button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
                className="w-full cursor-pointer flex items-center justify-between p-3 rounded-none border-2 border-zinc-700 dark:border-zinc-400 hover:bg-[#f7f4ee] dark:hover:bg-gray-950 bg-white dark:bg-gray-900 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {selectedTemplate ? (
                    <>
                      <TemplatePreviewImage
                        src={selectedTemplate.src}
                        alt={selectedTemplate.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-none flex-shrink-0 border-2 border-zinc-700 dark:border-zinc-400"
                      />
                      <span className="font-medium text-left truncate">{selectedTemplate.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Select a template...</span>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none ${
                    isTemplateDropdownOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <>
                <div
                  className={`fixed inset-0 z-10 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
                    isTemplateDropdownOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  onClick={() => setIsTemplateDropdownOpen(false)}
                  aria-hidden={!isTemplateDropdownOpen}
                />
                <div
                  className={`absolute z-20 w-full mt-2 bg-white dark:bg-gray-900 border-2 border-zinc-700 dark:border-zinc-400 rounded-none shadow-[8px_8px_0px_rgba(0,0,0,0.88)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] max-h-[60vh] overflow-y-auto [scrollbar-gutter:stable] origin-top transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
                    isTemplateDropdownOpen
                      ? 'opacity-100 scale-100 translate-y-0'
                      : 'pointer-events-none opacity-0 scale-[0.98] -translate-y-1'
                  }`}
                  aria-hidden={!isTemplateDropdownOpen}
                >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTemplateDropdownOpen(false);
                        customPhotoFileInputRef.current?.click();
                      }}
                      className={`w-full cursor-pointer flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                        selectedTemplate?.id === CUSTOM_PHOTO_TEMPLATE_ID
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          : ''
                      }`}
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-none border-2 border-dashed border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950">
                        <Upload className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="font-medium text-gray-900 dark:text-white">Upload your photo</div>
                        <div className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                          Your image · top & bottom text
                        </div>
                      </div>
                    </button>
                    {templates.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No templates available
                      </div>
                    ) : (
                      templates.map((template) => (
                        <button
                          type="button"
                          key={template.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            loadTemplate(template);
                            setIsTemplateDropdownOpen(false);
                          }}
                          className={`w-full cursor-pointer flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                            selectedTemplate?.id === template.id
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                              : ''
                          }`}
                        >
                          <TemplatePreviewImage
                            src={template.src}
                            alt={template.name}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-none flex-shrink-0 border-2 border-zinc-700 dark:border-zinc-400"
                          />
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-medium truncate text-gray-900 dark:text-white">
                              {template.name}
                            </div>
                            {template.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {template.description}
                              </div>
                            )}
                            {selectedTemplate?.id === template.id && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                                Selected
                              </div>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                </div>
              </>
            </div>
            
            {/* Always visible template grid when no template is selected */}
            {!selectedTemplate && !isTemplateDropdownOpen && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick select:</p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => customPhotoFileInputRef.current?.click()}
                    className="flex cursor-pointer items-center gap-3 p-3 rounded-none border-2 border-dashed border-zinc-700 dark:border-zinc-400 hover:bg-[#f7f4ee] dark:hover:bg-gray-950 bg-white dark:bg-gray-900 transition-colors text-left"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none border-2 border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950">
                      <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        Upload your photo
                      </div>
                      <div className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                        Use any image from your device
                      </div>
                    </div>
                  </button>
                  {templates.slice(0, 3).map((template) => (
                    <button
                      type="button"
                      key={template.id}
                      onClick={() => {
                        loadTemplate(template);
                        setIsTemplateDropdownOpen(false);
                      }}
                      className="flex cursor-pointer items-center gap-3 p-3 rounded-none border-2 border-zinc-700 dark:border-zinc-400 hover:bg-[#f7f4ee] dark:hover:bg-gray-950 bg-white dark:bg-gray-900 transition-colors text-left"
                    >
                      <TemplatePreviewImage
                        src={template.src}
                        alt={template.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-none flex-shrink-0 border-2 border-zinc-700 dark:border-zinc-400"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {template.name}
                        </div>
                        {template.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {templates.length > 3 && (
                  <button
                    onClick={() => setIsTemplateDropdownOpen(true)}
                    className="w-full cursor-pointer mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    View all {templates.length} templates →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Left side - Canvas (shown second on mobile, left side on desktop) */}
        <div className="flex flex-col min-h-0 flex-[2] lg:flex-[2] order-2 lg:order-1" style={{ height: '100%', overflow: 'hidden', minWidth: 0 }}>
          <div className="bg-white dark:bg-gray-900 rounded-none shadow-[8px_8px_0px_rgba(0,0,0,0.88)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] p-2 md:p-4 border-2 border-zinc-700 dark:border-zinc-400 flex-1 flex flex-col min-h-0" style={{ height: '100%', overflow: 'hidden' }}>
            <div
              ref={memePreviewContainerRef}
              tabIndex={-1}
              role="region"
              aria-label="Meme preview"
              className="flex justify-center items-center bg-[#f7f4ee] dark:bg-gray-950 rounded-none pt-5 pb-2 px-2 md:p-4 flex-1 min-h-[min(360px,50svh)] lg:min-h-0 outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 dark:focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
              style={{
                height: '100%',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Canvas - always rendered for proper initialization */}
              <canvas
                ref={canvasRef}
                className="rounded-none"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  height: 'auto',
                  width: 'auto',
                  margin: 'auto',
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 1,
                  opacity: selectedTemplate ? 1 : 0,
                  pointerEvents:
                    selectedTemplate && !isLoadingTemplate ? 'auto' : 'none',
                  display: 'block',
                  touchAction: 'none' // Prevent default touch behaviors like scrolling/zooming
                }}
              />

              {selectedTemplate && isLoadingTemplate && (
                <div
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                  className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-3 bg-[#f7f4ee]/90 px-6 text-center dark:bg-gray-950/90"
                >
                  <span
                    className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-700 border-t-transparent dark:border-zinc-300 dark:border-t-transparent"
                    aria-hidden
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Preparing template…
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Text boxes will be clickable in a moment.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Placeholder overlay when no template is selected */}
              {!selectedTemplate && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="pointer-events-none w-20 h-20 mb-1 rounded-none bg-white dark:bg-gray-900 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="pointer-events-none space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Get started
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Upload your own photo or pick a template in the panel {isMobileViewport ? 'above' : 'beside'} this canvas
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => customPhotoFileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Upload your photo
                  </Button>
                </div>
              )}
            </div>

            {/* Canvas controls */}
            <div className="mt-2 md:mt-4 flex gap-1.5 md:gap-2 flex-wrap flex-shrink-0">
              <Button 
                onClick={addText} 
                variant="outline" 
                size="sm"
                disabled={!selectedTemplate}
                className="text-xs md:text-sm"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Add Text</span>
                <span className="sm:hidden">Add</span>
              </Button>
              <Button
                onClick={deleteSelected}
                variant="outline"
                size="sm"
                disabled={!selectedElement}
                className="text-xs md:text-sm"
              >
                <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
              <Button
                onClick={downloadMeme}
                variant="primary"
                size="sm"
                disabled={!selectedTemplate}
                className="ml-auto text-xs md:text-sm"
              >
                <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">Save</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right side - Controls (text fields below on mobile, right side on desktop) */}
        <div
          className="flex flex-col min-h-0 flex-1 lg:max-w-md order-3 lg:order-2"
          style={{
            minWidth: 0,
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: isMobileViewport ? 'visible' : 'hidden',
          }}
        >
          <div
            className="space-y-2 md:space-y-4 flex-1 min-h-0 pb-2 md:pb-4 overflow-x-hidden lg:overflow-y-auto lg:[scrollbar-gutter:stable]"
            style={{ flex: '1 1 0%', minHeight: 0, WebkitOverflowScrolling: 'touch' }}
          >
          {/* Template selection - hidden on mobile, shown on desktop */}
          <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-none shadow-[8px_8px_0px_rgba(0,0,0,0.88)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] p-2 md:p-4 border-2 border-zinc-700 dark:border-zinc-400">
            <h2 className="text-base md:text-lg font-black uppercase tracking-tight mb-2 md:mb-4">Templates</h2>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
                className="w-full cursor-pointer flex items-center justify-between p-3 rounded-none border-2 border-zinc-700 dark:border-zinc-400 hover:bg-[#f7f4ee] dark:hover:bg-gray-950 bg-white dark:bg-gray-900 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {selectedTemplate ? (
                    <>
                      <TemplatePreviewImage
                        src={selectedTemplate.src}
                        alt={selectedTemplate.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-none flex-shrink-0 border-2 border-zinc-700 dark:border-zinc-400"
                      />
                      <span className="font-medium text-left truncate">{selectedTemplate.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Select a template...</span>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none ${
                    isTemplateDropdownOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <>
                <div
                  className={`fixed inset-0 z-10 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
                    isTemplateDropdownOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  onClick={() => setIsTemplateDropdownOpen(false)}
                  aria-hidden={!isTemplateDropdownOpen}
                />
                <div
                  className={`absolute z-20 w-full mt-2 bg-white dark:bg-gray-900 border-2 border-zinc-700 dark:border-zinc-400 rounded-none shadow-[8px_8px_0px_rgba(0,0,0,0.88)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] max-h-[60vh] overflow-y-auto [scrollbar-gutter:stable] origin-top transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
                    isTemplateDropdownOpen
                      ? 'opacity-100 scale-100 translate-y-0'
                      : 'pointer-events-none opacity-0 scale-[0.98] -translate-y-1'
                  }`}
                  aria-hidden={!isTemplateDropdownOpen}
                >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTemplateDropdownOpen(false);
                        customPhotoFileInputRef.current?.click();
                      }}
                      className={`w-full cursor-pointer flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                        selectedTemplate?.id === CUSTOM_PHOTO_TEMPLATE_ID
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          : ''
                      }`}
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-none border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                        <Upload className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="font-medium text-gray-900 dark:text-white">Upload your photo</div>
                        <div className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                          Your image · top & bottom text
                        </div>
                      </div>
                    </button>
                    {templates.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No templates available
                      </div>
                    ) : (
                      templates.map((template) => (
                        <button
                          type="button"
                          key={template.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            loadTemplate(template);
                            setIsTemplateDropdownOpen(false);
                          }}
                          className={`w-full cursor-pointer flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                            selectedTemplate?.id === template.id
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                              : ''
                          }`}
                        >
                          <TemplatePreviewImage
                            src={template.src}
                            alt={template.name}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-none flex-shrink-0 border border-gray-200 dark:border-gray-600"
                          />
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-medium truncate text-gray-900 dark:text-white">
                              {template.name}
                            </div>
                            {template.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {template.description}
                              </div>
                            )}
                            {selectedTemplate?.id === template.id && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                                Selected
                              </div>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                </div>
              </>
            </div>
            
            {/* Always visible template grid when no template is selected */}
            {!selectedTemplate && !isTemplateDropdownOpen && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick select:</p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => customPhotoFileInputRef.current?.click()}
                    className="flex cursor-pointer items-center gap-3 p-3 rounded-none border-2 border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-white dark:bg-gray-800 transition-all text-left"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                      <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        Upload your photo
                      </div>
                      <div className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                        Use any image from your device
                      </div>
                    </div>
                  </button>
                  {templates.slice(0, 3).map((template) => (
                    <button
                      type="button"
                      key={template.id}
                      onClick={() => {
                        loadTemplate(template);
                        setIsTemplateDropdownOpen(false);
                      }}
                      className="flex cursor-pointer items-center gap-3 p-3 rounded-none border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-white dark:bg-gray-800 transition-all text-left"
                    >
                      <TemplatePreviewImage
                        src={template.src}
                        alt={template.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-none flex-shrink-0 border border-gray-200 dark:border-gray-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {template.name}
                        </div>
                        {template.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {templates.length > 3 && (
                  <button
                    onClick={() => setIsTemplateDropdownOpen(true)}
                    className="w-full cursor-pointer mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    View all {templates.length} templates →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Text Fields List - Reworked */}
          {selectedTemplate &&
            !isLoadingTemplate &&
            allTextElements.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-none shadow-[8px_8px_0px_rgba(0,0,0,0.88)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] p-2 md:p-4 border-2 border-zinc-700 dark:border-zinc-400">
              <h2 className="text-base md:text-lg font-black uppercase tracking-tight mb-2 md:mb-4 flex items-center gap-2">
                <Type className="w-4 h-4 md:w-5 md:h-5" />
                Text Fields ({allTextElements.length})
              </h2>
              <div className="space-y-2 md:space-y-3">
                {allTextElements.map((element, index) => {
                  const isSelected = selectedElement === element;
                  const isExpanded = expandedElements.has(index);
                  const textValue = element.settings.text.value || '';
                  const currentTextInput = elementTextInputs[index] ?? textValue;
                  const fontSize = element.settings.font_size;
                  const strokeWidth = element.settings.stroke_width;
                  const useShadow = element.settings.use_shadow ?? false;
                  const shadowBlur = element.settings.shadow_blur ?? 0;
                  const shadowOffsetX = element.settings.shadow_offset_x ?? 0;
                  const shadowOffsetY = element.settings.shadow_offset_y ?? 0;
                  const isEditing = editingTextIndex === index;
                  
                  const toggleExpand = () => {
                    const newExpanded = new Set(expandedElements);
                    if (newExpanded.has(index)) {
                      newExpanded.delete(index);
                    } else {
                      newExpanded.add(index);
                    }
                    setExpandedElements(newExpanded);
                    stopEditing();
                  };

                  const selectElement = (opts?: { keepEditing?: boolean }) => {
                    if (!opts?.keepEditing) stopEditing();

                    const applySelection = (
                      ctrl: MemeCanvasController | null
                    ) => {
                      const list =
                        ctrl?.elements.filter(
                          (e): e is TextElement => e instanceof TextElement
                        ) ?? null;
                      const target =
                        list && index < list.length ? list[index]! : element;

                      setSelectedElement(target);
                      if (ctrl) {
                        ctrl.selectedElements = [target];
                        ctrl.emit('selectedElementsChange');
                      }
                    };

                    const ctrl = controllerRef.current;
                    if (ctrl) {
                      applySelection(ctrl);
                      return;
                    }

                    let attempts = 0;
                    const retry = () => {
                      const c = controllerRef.current;
                      if (c) {
                        applySelection(c);
                        return;
                      }
                      if (attempts++ < 24) {
                        requestAnimationFrame(retry);
                      } else {
                        applySelection(null);
                      }
                    };
                    requestAnimationFrame(retry);
                  };

                  const updateText = (newText: string) => {
                    setElementTextInputs(prev => ({ ...prev, [index]: newText }));
                    if (controllerRef.current) {
                      controllerRef.current.updateElement(element, 'text', {
                        value: newText,
                        multiline: true,
                      });
                      // Mark as dirty when text is updated (will be checked in elementsUpdated listener)
                    }
                  };

                  const resizeTextArea = (ta: HTMLTextAreaElement | null) => {
                    if (!ta) return;
                    // Prevent internal scrollbars; grow to fit content.
                    ta.style.height = 'auto';
                    ta.style.height = `${ta.scrollHeight}px`;
                  };

                  const beginEditing = () => {
                    editingElementRef.current = element;
                    selectElement({ keepEditing: true });
                    setEditingTextIndex(index);
                    requestAnimationFrame(() => {
                      const ta = textAreaRefs.current[index];
                      if (ta) {
                        ta.focus();
                        ta.select();
                        resizeTextArea(ta);
                      } else {
                        requestAnimationFrame(() => {
                          const t2 = textAreaRefs.current[index];
                          if (t2) {
                            t2.focus();
                            t2.select();
                            resizeTextArea(t2);
                          }
                        });
                      }
                    });
                  };

                  const handleTextFieldPointerDown = (e: React.PointerEvent) => {
                    e.stopPropagation();
                    if (e.pointerType === 'mouse' && e.button !== 0) return;
                    beginEditing();
                  };

                  return (
                    <div
                      key={index}
                      className={`rounded-none border-2 transition-colors ${
                        isSelected
                          ? 'border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950'
                          : 'border-gray-300 dark:border-gray-700 hover:border-zinc-700 dark:hover:border-zinc-400'
                      }`}
                    >
                      {/* Header */}
                      <div className="p-2 md:p-3 cursor-pointer">
                        <div className="flex items-center justify-between mb-1 md:mb-2">
                          <button
                            type="button"
                            onClick={() => selectElement()}
                            onDoubleClick={(e) => {
                              e.preventDefault();
                              beginEditing();
                            }}
                            className="flex-1 text-left flex items-center gap-2 cursor-pointer"
                          >
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200 bg-[#f7f4ee] dark:bg-gray-800 px-2 py-0.5 border border-zinc-700 dark:border-zinc-400 rounded-none">
                              Text {index + 1}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {element.settings.font_family} • {Math.round(fontSize)}px
                            </span>
                            <span
                              className={`block h-2 w-2 shrink-0 rounded-none ${isSelected ? 'bg-zinc-700 dark:bg-zinc-300' : 'opacity-0'}`}
                              aria-hidden
                            />
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={toggleExpand}
                              className="p-1.5 rounded-none border border-transparent hover:border-zinc-700 dark:hover:border-zinc-400 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 transition-colors cursor-pointer"
                              title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              <ChevronDown
                                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ease-out motion-reduce:transition-none ${
                                  isExpanded ? 'rotate-180' : 'rotate-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        
                        {/* Inline Text Input - border lives on wrapper so preview ↔ textarea swap cannot shift layout */}
                        <div
                          className="w-full min-h-[2.25rem] box-border rounded-none border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs transition-colors md:px-3 md:py-2 md:text-sm hover:bg-[#f7f4ee] dark:hover:bg-gray-800 focus-within:bg-[#f7f4ee] dark:focus-within:bg-gray-800"
                        >
                          {isEditing ? (
                            <textarea
                              ref={(node) => {
                                textAreaRefs.current[index] = node;
                                resizeTextArea(node);
                              }}
                              value={currentTextInput}
                              onChange={(e) => {
                                updateText(e.target.value);
                                resizeTextArea(e.currentTarget);
                              }}
                              onFocus={() => selectElement({ keepEditing: true })}
                              onBlur={stopEditing}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onPointerDown={(e) => {
                                e.stopPropagation();
                              }}
                              tabIndex={0}
                              className="m-0 block w-full min-h-[1.25rem] resize-none border-0 bg-transparent p-0 text-gray-900 placeholder:text-gray-400 outline-none ring-0 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-gray-500"
                              style={{ overflow: 'hidden' }}
                              rows={1}
                              placeholder={`Enter text for field ${index + 1}...`}
                            />
                          ) : (
                            <div
                              role="button"
                              tabIndex={0}
                              onPointerDown={handleTextFieldPointerDown}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  beginEditing();
                                }
                              }}
                              className="w-full cursor-text select-none break-words whitespace-pre-wrap text-gray-900 outline-none touch-manipulation dark:text-white"
                              title="Click to edit text"
                            >
                              {currentTextInput.trim().length > 0 ? (
                                currentTextInput
                              ) : (
                                <span className="text-gray-400">
                                  {`Enter text for field ${index + 1}...`}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expanded Properties */}
                      <div
                        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
                        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <div
                            className={`px-2 md:px-3 pb-2 md:pb-3 space-y-2 md:space-y-3 border-t border-gray-200 dark:border-gray-700 pt-2 md:pt-3 transition-[opacity] duration-200 ease-out motion-reduce:transition-none ${
                              isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                          >
                          {/* Font Size */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-medium">Font Size</label>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {Math.round(fontSize)}px
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (controllerRef.current) {
                                    const newSize = Math.max(12, fontSize - 2);
                                    controllerRef.current.updateElement(element, 'font_size', newSize);
                                  }
                                }}
                                className="px-2 py-1 border-2 border-zinc-700 dark:border-zinc-400 rounded-none hover:bg-[#f7f4ee] dark:hover:bg-gray-800 text-xs cursor-pointer"
                              >
                                −
                              </button>
                              <input
                                type="range"
                                min="12"
                                max="120"
                                step="1"
                                value={fontSize}
                                onChange={(e) => {
                                  if (controllerRef.current) {
                                    controllerRef.current.updateElement(element, 'font_size', Number(e.target.value));
                                  }
                                }}
                                className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-none appearance-none cursor-pointer"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (controllerRef.current) {
                                    const newSize = Math.min(120, fontSize + 2);
                                    controllerRef.current.updateElement(element, 'font_size', newSize);
                                  }
                                }}
                                className="px-2 py-1 border-2 border-zinc-700 dark:border-zinc-400 rounded-none hover:bg-[#f7f4ee] dark:hover:bg-gray-800 text-xs cursor-pointer"
                              >
                                +
                              </button>
                              <Input
                                type="number"
                                min="12"
                                max="120"
                                value={Math.round(fontSize)}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  if (!isNaN(value) && value >= 12 && value <= 120 && controllerRef.current) {
                                    controllerRef.current.updateElement(element, 'font_size', value);
                                  }
                                }}
                                className="w-16 text-xs h-8"
                              />
                            </div>
                          </div>

                          {/* Font Family */}
                          <div>
                            <label className="block text-xs font-medium mb-1">Font Family</label>
                            <select
                              value={element.settings.font_family}
                              onChange={(e) => {
                                if (controllerRef.current) {
                                  controllerRef.current.updateElement(element, 'font_family', e.target.value);
                                }
                              }}
                              className="w-full px-2 py-1.5 text-xs border-2 border-zinc-700 dark:border-zinc-400 rounded-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                            >
                              <option value="Impact">Impact</option>
                              <option value="Arial">Arial</option>
                              <option value="Helvetica">Helvetica</option>
                              <option value="Comic Sans MS">Comic Sans MS</option>
                              <option value="Times New Roman">Times New Roman</option>
                              <option value="sans-serif">Sans Serif</option>
                              <option value="Georgia">Georgia</option>
                              <option value="Verdana">Verdana</option>
                            </select>
                          </div>

                          {/* Text Color */}
                          <div>
                            <label className="block text-xs font-medium mb-1">Text Color</label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="color"
                                value={element.settings.color}
                                onChange={(e) => {
                                  if (controllerRef.current) {
                                    controllerRef.current.updateElement(element, 'color', e.target.value);
                                  }
                                }}
                                className="w-12 h-8 cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={element.settings.color}
                                onChange={(e) => {
                                  if (controllerRef.current && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
                                    controllerRef.current.updateElement(element, 'color', e.target.value);
                                  }
                                }}
                                placeholder="#FFFFFF"
                                className="flex-1 font-mono text-xs h-8"
                              />
                            </div>
                          </div>

                          {/* Stroke Color */}
                          <div>
                            <label className="block text-xs font-medium mb-1">Stroke Color</label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="color"
                                value={element.settings.stroke}
                                onChange={(e) => {
                                  if (controllerRef.current) {
                                    controllerRef.current.updateElement(element, 'stroke', e.target.value);
                                  }
                                }}
                                className="w-12 h-8 cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={element.settings.stroke}
                                onChange={(e) => {
                                  if (controllerRef.current && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
                                    controllerRef.current.updateElement(element, 'stroke', e.target.value);
                                  }
                                }}
                                placeholder="#000000"
                                className="flex-1 font-mono text-xs h-8"
                              />
                            </div>
                          </div>

                          {/* Stroke Width */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-medium">Stroke Width</label>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {Math.round(strokeWidth)}px
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (controllerRef.current) {
                                    const newWidth = Math.max(0, strokeWidth - 1);
                                    controllerRef.current.updateElement(element, 'stroke_width', newWidth);
                                  }
                                }}
                                className="px-2 py-1 border-2 border-zinc-700 dark:border-zinc-400 rounded-none hover:bg-[#f7f4ee] dark:hover:bg-gray-800 text-xs cursor-pointer"
                              >
                                −
                              </button>
                              <input
                                type="range"
                                min="0"
                                max="20"
                                step="0.5"
                                value={strokeWidth}
                                onChange={(e) => {
                                  if (controllerRef.current) {
                                    controllerRef.current.updateElement(element, 'stroke_width', Number(e.target.value));
                                  }
                                }}
                                className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-none appearance-none cursor-pointer"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (controllerRef.current) {
                                    const newWidth = Math.min(20, strokeWidth + 1);
                                    controllerRef.current.updateElement(element, 'stroke_width', newWidth);
                                  }
                                }}
                                className="px-2 py-1 border-2 border-zinc-700 dark:border-zinc-400 rounded-none hover:bg-[#f7f4ee] dark:hover:bg-gray-800 text-xs cursor-pointer"
                              >
                                +
                              </button>
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                step="0.5"
                                value={strokeWidth}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  if (!isNaN(value) && value >= 0 && value <= 20 && controllerRef.current) {
                                    controllerRef.current.updateElement(element, 'stroke_width', value);
                                  }
                                }}
                                className="w-16 text-xs h-8"
                              />
                            </div>
                          </div>

                          {/* Use Shadow Toggle */}
                          <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={useShadow}
                                onChange={(e) => {
                                  if (controllerRef.current) {
                                    controllerRef.current.updateElement(element, 'use_shadow', e.target.checked);
                                  }
                                }}
                                className="w-4 h-4 text-zinc-900 dark:text-zinc-100 border-zinc-700 dark:border-zinc-400 rounded-none"
                              />
                              <span className="text-xs font-medium">Use Shadow Instead of Stroke</span>
                            </label>
                          </div>

                          {/* Shadow Controls - Only show if useShadow is true */}
                          {useShadow && (
                            <>
                              {/* Shadow Color */}
                              <div>
                                <label className="block text-xs font-medium mb-1">Shadow Color</label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="color"
                                    value={element.settings.shadow_color || '#000000'}
                                    onChange={(e) => {
                                      if (controllerRef.current) {
                                        controllerRef.current.updateElement(element, 'shadow_color', e.target.value);
                                      }
                                    }}
                                    className="w-12 h-8 cursor-pointer"
                                  />
                                  <Input
                                    type="text"
                                    value={element.settings.shadow_color || '#000000'}
                                    onChange={(e) => {
                                      if (controllerRef.current && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
                                        controllerRef.current.updateElement(element, 'shadow_color', e.target.value);
                                      }
                                    }}
                                    placeholder="#000000"
                                    className="flex-1 font-mono text-xs h-8"
                                  />
                                </div>
                              </div>

                              {/* Shadow Blur */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="block text-xs font-medium">Shadow Blur</label>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {Math.round(shadowBlur)}px
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (controllerRef.current) {
                                        const newBlur = Math.max(0, shadowBlur - 1);
                                        controllerRef.current.updateElement(element, 'shadow_blur', newBlur);
                                      }
                                    }}
                                    className="px-2 py-1 border-2 border-zinc-700 dark:border-zinc-400 rounded-none hover:bg-[#f7f4ee] dark:hover:bg-gray-800 text-xs cursor-pointer"
                                  >
                                    −
                                  </button>
                                  <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    step="1"
                                    value={shadowBlur}
                                    onChange={(e) => {
                                      if (controllerRef.current) {
                                        controllerRef.current.updateElement(element, 'shadow_blur', Number(e.target.value));
                                      }
                                    }}
                                    className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-none appearance-none cursor-pointer"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (controllerRef.current) {
                                        const newBlur = Math.min(50, shadowBlur + 1);
                                        controllerRef.current.updateElement(element, 'shadow_blur', newBlur);
                                      }
                                    }}
                                    className="px-2 py-1 border-2 border-zinc-700 dark:border-zinc-400 rounded-none hover:bg-[#f7f4ee] dark:hover:bg-gray-800 text-xs cursor-pointer"
                                  >
                                    +
                                  </button>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="50"
                                    step="1"
                                    value={Math.round(shadowBlur)}
                                    onChange={(e) => {
                                      const value = Number(e.target.value);
                                      if (!isNaN(value) && value >= 0 && value <= 50 && controllerRef.current) {
                                        controllerRef.current.updateElement(element, 'shadow_blur', value);
                                      }
                                    }}
                                    className="w-16 text-xs h-8"
                                  />
                                </div>
                              </div>

                              {/* Shadow Offset X */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="block text-xs font-medium">Shadow Offset X</label>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {Math.round(shadowOffsetX)}px
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (controllerRef.current) {
                                        const newOffset = shadowOffsetX - 1;
                                        controllerRef.current.updateElement(element, 'shadow_offset_x', newOffset);
                                      }
                                    }}
                                    className="px-2 py-1 border-2 border-zinc-700 dark:border-zinc-400 rounded-none hover:bg-[#f7f4ee] dark:hover:bg-gray-800 text-xs cursor-pointer"
                                  >
                                    −
                                  </button>
                                  <input
                                    type="range"
                                    min="-20"
                                    max="20"
                                    step="1"
                                    value={shadowOffsetX}
                                    onChange={(e) => {
                                      if (controllerRef.current) {
                                        controllerRef.current.updateElement(element, 'shadow_offset_x', Number(e.target.value));
                                      }
                                    }}
                                    className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-none appearance-none cursor-pointer"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (controllerRef.current) {
                                        const newOffset = shadowOffsetX + 1;
                                        controllerRef.current.updateElement(element, 'shadow_offset_x', newOffset);
                                      }
                                    }}
                                    className="px-2 py-1 border-2 border-zinc-700 dark:border-zinc-400 rounded-none hover:bg-[#f7f4ee] dark:hover:bg-gray-800 text-xs cursor-pointer"
                                  >
                                    +
                                  </button>
                                  <Input
                                    type="number"
                                    min="-20"
                                    max="20"
                                    step="1"
                                    value={Math.round(shadowOffsetX)}
                                    onChange={(e) => {
                                      const value = Number(e.target.value);
                                      if (!isNaN(value) && value >= -20 && value <= 20 && controllerRef.current) {
                                        controllerRef.current.updateElement(element, 'shadow_offset_x', value);
                                      }
                                    }}
                                    className="w-16 text-xs h-8"
                                  />
                                </div>
                              </div>

                              {/* Shadow Offset Y */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="block text-xs font-medium">Shadow Offset Y</label>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {Math.round(shadowOffsetY)}px
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (controllerRef.current) {
                                        const newOffset = shadowOffsetY - 1;
                                        controllerRef.current.updateElement(element, 'shadow_offset_y', newOffset);
                                      }
                                    }}
                                    className="px-2 py-1 border-2 border-zinc-700 dark:border-zinc-400 rounded-none hover:bg-[#f7f4ee] dark:hover:bg-gray-800 text-xs cursor-pointer"
                                  >
                                    −
                                  </button>
                                  <input
                                    type="range"
                                    min="-20"
                                    max="20"
                                    step="1"
                                    value={shadowOffsetY}
                                    onChange={(e) => {
                                      if (controllerRef.current) {
                                        controllerRef.current.updateElement(element, 'shadow_offset_y', Number(e.target.value));
                                      }
                                    }}
                                    className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-none appearance-none cursor-pointer"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (controllerRef.current) {
                                        const newOffset = shadowOffsetY + 1;
                                        controllerRef.current.updateElement(element, 'shadow_offset_y', newOffset);
                                      }
                                    }}
                                    className="px-2 py-1 border-2 border-zinc-700 dark:border-zinc-400 rounded-none hover:bg-[#f7f4ee] dark:hover:bg-gray-800 text-xs cursor-pointer"
                                  >
                                    +
                                  </button>
                                  <Input
                                    type="number"
                                    min="-20"
                                    max="20"
                                    step="1"
                                    value={Math.round(shadowOffsetY)}
                                    onChange={(e) => {
                                      const value = Number(e.target.value);
                                      if (!isNaN(value) && value >= -20 && value <= 20 && controllerRef.current) {
                                        controllerRef.current.updateElement(element, 'shadow_offset_y', value);
                                      }
                                    }}
                                    className="w-16 text-xs h-8"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {/* Text Alignment */}
                          <div>
                            <label className="block text-xs font-medium mb-1">Text Alignment</label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {(['left', 'center', 'right'] as const).map((align) => (
                                <button
                                  key={align}
                                  type="button"
                                  onClick={() => {
                                    if (controllerRef.current) {
                                      controllerRef.current.updateElement(element, 'horizontal_align', {
                                        valid: ['left', 'center', 'right'] as const,
                                        current: align,
                                      });
                                    }
                                  }}
                                  className={`px-2 py-1.5 border-2 rounded-none text-xs font-medium transition-colors cursor-pointer ${
                                    element.settings.horizontal_align.current === align
                                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                                      : 'border-zinc-700 dark:border-zinc-400 hover:bg-[#f7f4ee] dark:hover:bg-gray-800'
                                  }`}
                                >
                                  {align.charAt(0).toUpperCase() + align.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Delete Button */}
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                if (controllerRef.current) {
                                  controllerRef.current.removeElements([element]);
                                  const newExpanded = new Set(expandedElements);
                                  newExpanded.delete(index);
                                  setExpandedElements(newExpanded);
                                }
                              }}
                              className="w-full px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 border-2 border-red-700 dark:border-red-500 rounded-none hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete Text Field
                            </button>
                          </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legacy Text input - keeping for backward compatibility but can be removed */}
          {false && showTextInput && selectedElement && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Type className="w-5 h-5" />
                Edit Text
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Text (use Enter for new lines)
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={4}
                    placeholder="Enter your text..."
                  />
                </div>
                {selectedElement instanceof TextElement && (() => {
                  // Get current element from controller to ensure we have latest values
                  const currentElement = controllerRef.current?.selectedElements[0];
                  const element = (currentElement instanceof TextElement ? currentElement : selectedElement) as TextElement;
                  const fontSize = element.settings.font_size;
                  const strokeWidth = element.settings.stroke_width;
                  
                  return (
                    <div className="space-y-4">
                      {/* Font Size with Slider and Input */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium">
                            Font Size
                          </label>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {Math.round(fontSize)}px
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (controllerRef.current) {
                                const newSize = Math.max(12, fontSize - 2);
                                controllerRef.current.updateElement(
                                  element,
                                  'font_size',
                                  newSize
                                );
                              }
                            }}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          −
                        </button>
                        <input
                          type="range"
                          min="12"
                          max="120"
                          step="1"
                          value={fontSize}
                          onChange={(e) => {
                            if (controllerRef.current) {
                              controllerRef.current.updateElement(
                                element,
                                'font_size',
                                Number(e.target.value)
                              );
                            }
                          }}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (controllerRef.current) {
                              const newSize = Math.min(120, fontSize + 2);
                              controllerRef.current.updateElement(
                                element,
                                'font_size',
                                newSize
                              );
                            }
                          }}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          +
                        </button>
                        <Input
                          type="number"
                          min="12"
                          max="120"
                          value={Math.round(fontSize)}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (!isNaN(value) && value >= 12 && value <= 120 && controllerRef.current) {
                              controllerRef.current.updateElement(
                                element,
                                'font_size',
                                value
                              );
                            }
                          }}
                          onBlur={(e) => {
                            // Ensure value is valid on blur
                            const value = Number(e.target.value);
                            if (isNaN(value) || value < 12 || value > 120) {
                              if (controllerRef.current) {
                                const clampedValue = Math.max(12, Math.min(120, value || fontSize));
                                controllerRef.current.updateElement(
                                  element,
                                  'font_size',
                                  clampedValue
                                );
                              }
                            }
                          }}
                          className="w-20"
                        />
                      </div>
                    </div>
                    {/* Font Family */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Font Family
                      </label>
                      <select
                        value={element.settings.font_family}
                        onChange={(e) => {
                          if (controllerRef.current) {
                            controllerRef.current.updateElement(
                              element,
                              'font_family',
                              e.target.value
                            );
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                      >
                        <option value="Impact">Impact</option>
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="sans-serif">Sans Serif</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>

                    {/* Text Color */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Text Color
                      </label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={element.settings.color}
                          onChange={(e) => {
                            if (controllerRef.current) {
                              controllerRef.current.updateElement(
                                element,
                                'color',
                                e.target.value
                              );
                            }
                          }}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={element.settings.color}
                          onChange={(e) => {
                            if (controllerRef.current && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
                              controllerRef.current.updateElement(
                                element,
                                'color',
                                e.target.value
                              );
                            }
                          }}
                          placeholder="#FFFFFF"
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    </div>

                    {/* Stroke Color */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Stroke Color
                      </label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={element.settings.stroke}
                          onChange={(e) => {
                            if (controllerRef.current) {
                              controllerRef.current.updateElement(
                                element,
                                'stroke',
                                e.target.value
                              );
                            }
                          }}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={element.settings.stroke}
                          onChange={(e) => {
                            if (controllerRef.current && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
                              controllerRef.current.updateElement(
                                element,
                                'stroke',
                                e.target.value
                              );
                            }
                          }}
                          placeholder="#000000"
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    </div>

                    {/* Stroke Width */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">
                          Stroke Width
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {Math.round(strokeWidth)}px
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (controllerRef.current) {
                              const newWidth = Math.max(0, strokeWidth - 1);
                              controllerRef.current.updateElement(
                                element,
                                'stroke_width',
                                newWidth
                              );
                            }
                          }}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          −
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="0.5"
                          value={strokeWidth}
                          onChange={(e) => {
                            if (controllerRef.current) {
                              controllerRef.current.updateElement(
                                element,
                                'stroke_width',
                                Number(e.target.value)
                              );
                            }
                          }}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (controllerRef.current) {
                              const newWidth = Math.min(20, strokeWidth + 1);
                              controllerRef.current.updateElement(
                                element,
                                'stroke_width',
                                newWidth
                              );
                            }
                          }}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          +
                        </button>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={strokeWidth}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (!isNaN(value) && value >= 0 && value <= 20 && controllerRef.current) {
                              controllerRef.current.updateElement(
                                element,
                                'stroke_width',
                                value
                              );
                            }
                          }}
                          onBlur={(e) => {
                            // Ensure value is valid on blur
                            const value = Number(e.target.value);
                            if (isNaN(value) || value < 0 || value > 20) {
                              if (controllerRef.current) {
                                const clampedValue = Math.max(0, Math.min(20, value || strokeWidth));
                                controllerRef.current.updateElement(
                                  element,
                                  'stroke_width',
                                  clampedValue
                                );
                              }
                            }
                          }}
                          className="w-20"
                        />
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Text Alignment
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => {
                              if (controllerRef.current) {
                                controllerRef.current.updateElement(
                                  element,
                                  'horizontal_align',
                                  {
                                    valid: ['left', 'center', 'right'] as const,
                                    current: align,
                                  }
                                );
                              }
                            }}
                            className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                              element.settings.horizontal_align.current === align
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            {align.charAt(0).toUpperCase() + align.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  );
                })()}
              </div>
            </div>
          )}

          </div>
        </div>
      </div>
    </div>
  );
};

