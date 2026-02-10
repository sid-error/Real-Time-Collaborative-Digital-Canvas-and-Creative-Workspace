import { X } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Interface defining the properties for the Modal component
 * 
 * @interface ModalProps
 * @property {boolean} isOpen - Controls the visibility of the modal
 * @property {() => void} onClose - Callback function to close the modal
 * @property {string} title - Title displayed in the modal header
 * @property {ReactNode} children - Content to be rendered inside the modal body
 */
interface ModalProps {
  /** Controls the visibility of the modal */
  isOpen: boolean;
  /** Callback function to close the modal */
  onClose: () => void;
  /** Title displayed in the modal header */
  title: string;
  /** Content to be rendered inside the modal body */
  children: ReactNode;
}

/**
 * Modal Component
 * 
 * @component
 * @description
 * A reusable, accessible modal dialog component with overlay, animations,
 * and keyboard navigation support. Provides consistent modal behavior
 * across the application with proper ARIA attributes and focus management.
 * 
 * @features
 * - **Accessibility**: Full ARIA support and keyboard navigation (Escape to close)
 * - **Overlay Click**: Closes modal when clicking outside content area
 * - **Animations**: Smooth fade-in and zoom-in animations
 * - **Focus Management**: Auto-focuses close button for keyboard users
 * - **Responsive**: Adapts to different screen sizes with padding
 * - **Customizable**: Accepts any React content as children
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 * >
 *   <p>Are you sure you want to proceed?</p>
 *   <div className="flex gap-3 mt-6">
 *     <Button onClick={() => setIsOpen(false)}>Cancel</Button>
 *     <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
 *   </div>
 * </Modal>
 * 
 * // Form in modal
 * <Modal
 *   isOpen={showFormModal}
 *   onClose={closeFormModal}
 *   title="Create New Item"
 * >
 *   <Form onSubmit={handleSubmit}>
 *     <Form.Field name="name" label="Item Name" />
 *     <Form.Field name="description" label="Description" type="textarea" />
 *     <Button type="submit">Create Item</Button>
 *   </Form>
 * </Modal>
 * ```
 * 
 * @param {ModalProps} props - Component properties
 * @param {boolean} props.isOpen - Modal visibility state
 * @param {() => void} props.onClose - Close handler function
 * @param {string} props.title - Modal title text
 * @param {ReactNode} props.children - Modal content
 * 
 * @returns {JSX.Element | null} Modal component or null if not open
 */
export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  // Early return if modal is not open - prevents unnecessary rendering
  if (!isOpen) return null;

  /**
   * Handles overlay click events
   * Closes modal only when clicking directly on the overlay background,
   * not when clicking inside the modal content area
   * 
   * @function handleOverlayClick
   * @param {React.MouseEvent<HTMLDivElement>} e - Mouse event
   */
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    // Check if click target is the overlay itself (not modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Handles keyboard events for accessibility
   * Closes modal when Escape key is pressed
   * 
   * @function handleKeyDown
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1} // Make overlay focusable for keyboard navigation
    >
      {/* Modal container with animations */}
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
        role="document"
      >
        {/* Modal header with title and close button */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          {/* Modal title - used for aria-labelledby */}
          <h3 
            id="modal-title" 
            className="text-xl font-bold text-slate-900 dark:text-white"
          >
            {title}
          </h3>
          {/* Close button with keyboard focus */}
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
            autoFocus // Auto-focus close button for keyboard users
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>
        
        {/* Modal content area - scrollable if content exceeds height */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};