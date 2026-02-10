import React, { useState } from 'react';
import { 
  Edit2, Brush, Highlighter, SprayCan, 
  Minus, Plus, Zap, ZapOff, Grid3x3,
  Circle, Square, Type
} from 'lucide-react';
import type { BrushType, StrokeStyle } from '../../types/canvas';

/**
 * Props for the BrushSettings component
 * 
 * @interface BrushSettingsProps
 * @property {number} strokeWidth - Current stroke width in pixels
 * @property {(width: number) => void} onStrokeWidthChange - Callback when stroke width changes
 * @property {BrushType} brushType - Current brush type
 * @property {(type: BrushType) => void} onBrushTypeChange - Callback when brush type changes
 * @property {boolean} pressureSensitive - Whether pressure sensitivity is enabled
 * @property {(enabled: boolean) => void} onPressureSensitiveChange - Callback for pressure sensitivity toggle
 * @property {StrokeStyle} strokeStyle - Current stroke style configuration
 * @property {(style: StrokeStyle) => void} onStrokeStyleChange - Callback when stroke style changes
 * @property {string} [className] - Additional CSS class names for the container
 */
interface BrushSettingsProps {
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  brushType: BrushType;
  onBrushTypeChange: (type: BrushType) => void;
  pressureSensitive: boolean;
  onPressureSensitiveChange: (enabled: boolean) => void;
  strokeStyle: StrokeStyle;
  onStrokeStyleChange: (style: StrokeStyle) => void;
  className?: string;
}

/**
 * BrushSettings Component
 * 
 * @component
 * @description
 * A comprehensive brush settings panel for a drawing application that allows users to
 * configure brush type, stroke width, stroke style, line caps, and pressure sensitivity.
 * 
 * Features:
 * - Multiple brush types (Pencil, Brush, Marker, Airbrush, Highlighter)
 * - Adjustable stroke width with visual preview
 * - Stroke styles (Solid, Dashed, Dotted)
 * - Line cap controls (Butt, Round, Square)
 * - Pressure sensitivity toggle
 * - Interactive preview of current settings
 * 
 * @example
 * ```tsx
 * <BrushSettings
 *   strokeWidth={5}
 *   onStrokeWidthChange={(width) => setStrokeWidth(width)}
 *   brushType="pencil"
 *   onBrushTypeChange={(type) => setBrushType(type)}
 *   pressureSensitive={true}
 *   onPressureSensitiveChange={(enabled) => setPressureSensitive(enabled)}
 *   strokeStyle={{ type: 'solid', lineCap: 'round' }}
 *   onStrokeStyleChange={(style) => setStrokeStyle(style)}
 * />
 * ```
 */
const BrushSettings: React.FC<BrushSettingsProps> = ({
  strokeWidth,
  onStrokeWidthChange,
  brushType,
  onBrushTypeChange,
  pressureSensitive,
  onPressureSensitiveChange,
  strokeStyle,
  onStrokeStyleChange,
  className = ''
}) => {
  // State to control dropdown visibility
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Configuration array for available brush types
   * 
   * @constant {Array<Object>} brushTypes
   * @property {BrushType} type - Unique identifier for the brush
   * @property {string} label - Display name for the brush
   * @property {React.ReactNode} icon - Icon component for the brush
   * @property {string} description - Brief description of brush characteristics
   * @property {number} minWidth - Minimum stroke width for this brush type
   * @property {number} maxWidth - Maximum stroke width for this brush type
   */
  const brushTypes: Array<{
    type: BrushType;
    label: string;
    icon: React.ReactNode;
    description: string;
    minWidth: number;
    maxWidth: number;
  }> = [
    {
      type: 'pencil',
      label: 'Pencil',
      icon: <Edit2 className="w-4 h-4" />,
      description: 'Sharp, precise lines',
      minWidth: 1,
      maxWidth: 10
    },
    {
      type: 'brush',
      label: 'Brush',
      icon: <Brush className="w-4 h-4" />,
      description: 'Soft, textured strokes',
      minWidth: 3,
      maxWidth: 30
    },
    {
      type: 'marker',
      label: 'Marker',
      icon: <Highlighter className="w-4 h-4" />,
      description: 'Solid, opaque lines',
      minWidth: 5,
      maxWidth: 20
    },
    {
      type: 'airbrush',
      label: 'Airbrush',
      icon: <SprayCan className="w-4 h-4" />,
      description: 'Soft, gradient strokes',
      minWidth: 10,
      maxWidth: 50
    },
    {
      type: 'highlighter',
      label: 'Highlighter',
      icon: <Highlighter className="w-4 h-4" />,
      description: 'Semi-transparent overlay',
      minWidth: 10,
      maxWidth: 40
    }
  ];

  /**
   * Configuration array for stroke styles
   * 
   * @constant {Array<Object>} strokeStyles
   * @property {StrokeStyle['type']} type - Type of stroke pattern
   * @property {string} label - Display name for the stroke style
   * @property {React.ReactNode} icon - Icon component for the stroke style
   * @property {number[]} pattern - Dash array pattern for dashed/dotted strokes
   */
  const strokeStyles: Array<{
    type: StrokeStyle['type'];
    label: string;
    icon: React.ReactNode;
    pattern: number[];
  }> = [
    {
      type: 'solid',
      label: 'Solid',
      icon: <Minus className="w-4 h-4" />,
      pattern: []
    },
    {
      type: 'dashed',
      label: 'Dashed',
      icon: <Grid3x3 className="w-4 h-4" />,
      pattern: [5, 5]
    },
    {
      type: 'dotted',
      label: 'Dotted',
      icon: <Circle className="w-4 h-4" />,
      pattern: [1, 3]
    }
  ];

  /**
   * Configuration array for line cap options
   * 
   * @constant {Array<Object>} lineCaps
   * @property {'butt' | 'round' | 'square'} value - CSS line-cap value
   * @property {string} label - Display name for the line cap
   * @property {React.ReactNode} icon - Icon representing the line cap shape
   */
  const lineCaps: Array<{
    value: 'butt' | 'round' | 'square';
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      value: 'butt',
      label: 'Butt',
      icon: <Square className="w-3 h-3" />
    },
    {
      value: 'round',
      label: 'Round',
      icon: <Circle className="w-3 h-3" />
    },
    {
      value: 'square',
      label: 'Square',
      icon: <Square className="w-3 h-3" />
    }
  ];

  // Find the currently selected brush configuration
  const currentBrush = brushTypes.find(b => b.type === brushType);

  return (
    <div className={`relative ${className}`}>
      {/* 
        Brush preview button - Toggles the settings dropdown 
        Shows current brush type and stroke width
      */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        aria-label="Open brush settings"
      >
        <div className="relative">
          {/* Visual representation of current brush size */}
          <div className="w-8 h-8 flex items-center justify-center">
            <div 
              className="rounded-full"
              style={{
                width: `${strokeWidth}px`,
                height: `${strokeWidth}px`,
                backgroundColor: '#3b82f6',
                opacity: brushType === 'highlighter' ? 0.5 : 1
              }}
            />
          </div>
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {currentBrush?.label}
          </div>
          <div className="text-xs text-slate-500">
            {strokeWidth}px
          </div>
        </div>
      </button>

      {/* Brush settings dropdown - Appears when isOpen is true */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-50">
          {/* Brush type selection section */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Brush Type
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {brushTypes.map((brush) => (
                <button
                  key={brush.type}
                  type="button"
                  onClick={() => {
                    onBrushTypeChange(brush.type);
                    // Adjust stroke width to fit within new brush type's valid range
                    if (strokeWidth < brush.minWidth) {
                      onStrokeWidthChange(brush.minWidth);
                    } else if (strokeWidth > brush.maxWidth) {
                      onStrokeWidthChange(brush.maxWidth);
                    }
                  }}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                    brushType === brush.type
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                  aria-label={`Select ${brush.label} brush`}
                  title={brush.description}
                >
                  <div className="mb-1 p-1.5 rounded bg-white dark:bg-slate-800">
                    {brush.icon}
                  </div>
                  <span className="text-xs font-medium">{brush.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stroke width control section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Stroke Width
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                  {strokeWidth}px
                </span>
                {currentBrush && (
                  <span className="text-xs text-slate-500">
                    ({currentBrush.minWidth}-{currentBrush.maxWidth}px)
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Range slider for precise width control */}
              <input
                type="range"
                min={currentBrush?.minWidth || 1}
                max={currentBrush?.maxWidth || 50}
                value={strokeWidth}
                onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
              />
              
              {/* Quick preset buttons for common stroke widths */}
              <div className="flex justify-between">
                {[1, 3, 5, 10, 20].map((width) => (
                  <button
                    key={width}
                    type="button"
                    onClick={() => onStrokeWidthChange(width)}
                    className={`px-2 py-1 text-xs rounded ${
                      strokeWidth === width
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {width}px
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stroke style selection section */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Stroke Style
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {strokeStyles.map((style) => (
                <button
                  key={style.type}
                  type="button"
                  onClick={() => onStrokeStyleChange({
                    type: style.type,
                    dashArray: style.pattern,
                    lineCap: strokeStyle.lineCap || 'round',
                    lineJoin: strokeStyle.lineJoin || 'round'
                  })}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                    strokeStyle.type === style.type
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="mb-1 p-1.5">
                    {style.icon}
                  </div>
                  <span className="text-xs font-medium">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Line cap and pressure sensitivity settings */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Line cap selection */}
              <div>
                <h4 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Line Cap
                </h4>
                <div className="flex gap-1">
                  {lineCaps.map((cap) => (
                    <button
                      key={cap.value}
                      type="button"
                      onClick={() => onStrokeStyleChange({
                        ...strokeStyle,
                        lineCap: cap.value
                      })}
                      className={`p-1.5 rounded ${
                        strokeStyle.lineCap === cap.value
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                      }`}
                      title={cap.label}
                    >
                      {cap.icon}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Pressure sensitivity toggle */}
              <div>
                <h4 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Pressure Sensitivity
                </h4>
                <button
                  type="button"
                  onClick={() => onPressureSensitiveChange(!pressureSensitive)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    pressureSensitive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {pressureSensitive ? <Zap size={14} /> : <ZapOff size={14} />}
                  {pressureSensitive ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive brush preview section */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Preview
              </h4>
              <div className="text-xs text-slate-500">
                {currentBrush?.description}
              </div>
            </div>
            <div className="h-16 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <div className="relative w-full h-full">
                {/* SVG path showing current brush settings applied */}
                <svg width="100%" height="100%" className="overflow-visible">
                  <path
                    d="M10,30 Q50,10 90,30 T170,30"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={strokeWidth}
                    strokeLinecap={strokeStyle.lineCap || 'round'}
                    strokeLinejoin={strokeStyle.lineJoin || 'round'}
                    strokeDasharray={strokeStyle.dashArray?.join(',')}
                    opacity={brushType === 'highlighter' ? 0.5 : 1}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Close dropdown button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Apply Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default BrushSettings;