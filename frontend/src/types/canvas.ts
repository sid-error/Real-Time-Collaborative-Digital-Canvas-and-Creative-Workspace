/**
 * Type definition for a 2D coordinate point
 * Used to represent positions on the canvas
 */
export type Point = { 
  x: number; 
  y: number; 
};

/**
 * Interface defining brush properties for freehand drawing
 */
export interface BrushProperties {
  /** Brush color in hex format */
  color: string;
  /** Brush stroke width in pixels */
  width: number;
  /** Brush opacity (0 to 1) */
  opacity: number;
  /** Brush type/style */
  type: 'solid' | 'textured' | 'airbrush';
}

/**
 * Interface for brush configuration
 */
export interface BrushConfig {
  minWidth: number;
  maxWidth: number;
  pressureSensitive: boolean;
  smoothing: number; // 0 to 1
  antiAliasing: boolean;
}

/**
 * Extended DrawingElement interface with brush properties
 */
export interface DrawingElement {
  /** Unique identifier for the drawing element */
  id: string;
  
  /** Type of drawing element */
  type: 'pencil' | 'rectangle' | 'circle' | 'text' | 'line' | 'arrow' | 'eraser';
  
  /** 
   * Array of points for freehand pencil drawings
   * Each point represents a segment of the drawn line
   * Only applicable when type is 'pencil' or 'line' or 'eraser'
   */
  points?: Point[];
  
  /** 
   * X-coordinate position for shape-based elements
   * Applicable for rectangle, circle, and text types
   */
  x?: number;
  
  /** 
   * Y-coordinate position for shape-based elements
   * Applicable for rectangle, circle, and text types
   */
  y?: number;
  
  /** 
   * Width dimension for rectangle elements
   * Only applicable when type is 'rectangle'
   */
  width?: number;
  
  /** 
   * Height dimension for rectangle elements
   * Only applicable when type is 'rectangle' or 'circle'
   * For circles, this is used to calculate radius
   */
  height?: number;
  
  /** 
   * Color of the drawing element in hex format
   * Example: '#2563eb' for blue
   */
  color: string;
  
  /** 
   * Stroke width/thickness of the drawing element in pixels
   * Controls the visual weight of lines and borders
   */
  strokeWidth: number;
  
  /** 
   * Opacity of the drawing element (0 to 1)
   */
  opacity?: number;
  
  /** 
   * Brush properties for freehand drawing
   * Only applicable for pencil type
   */
  brushProperties?: BrushProperties;
}

export type BrushType = 'pencil' | 'brush' | 'marker' | 'airbrush' | 'highlighter';

export interface BrushProperties {
  color: string;
  width: number;
  opacity: number;
  type: BrushType;
  texture?: string; // URL or data URI for brush texture
  spacing?: number; // Spacing between brush stamps
  scatter?: number; // Random scatter of brush stamps
}

export interface StrokeStyle {
  type: 'solid' | 'dashed' | 'dotted';
  dashArray?: number[]; // For custom dash patterns
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'bevel' | 'round' | 'miter';
}