import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';

/* -------------------------------------------------------------------------------------------------
 * Dialog - Core Components
 * -----------------------------------------------------------------------------------------------*/

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

/* -------------------------------------------------------------------------------------------------
 * Dialog Overlay - Backdrop with advanced animation capabilities
 * -----------------------------------------------------------------------------------------------*/

const overlayVariants = cva(
  "fixed inset-0 z-50 backdrop-blur-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-black/80",
        glass: "bg-white/10 backdrop-blur-md",
        frost: "bg-slate-900/70 backdrop-blur-md",
        minimal: "bg-black/50",
        vibrant: "bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-pink-900/80",
      },
      animation: {
        fade: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        scale: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:scale-100 data-[state=closed]:scale-95 duration-300",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      animation: "fade",
    },
  }
);

interface DialogOverlayProps 
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>,
    VariantProps<typeof overlayVariants> {}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(({ className, variant, animation, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={overlayVariants({ variant, animation, className })}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/* -------------------------------------------------------------------------------------------------
 * Dialog Content - Enhanced with variants and morphing capabilities
 * -----------------------------------------------------------------------------------------------*/

const contentVariants = cva(
  "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 p-6 shadow-2xl duration-200 border",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-[calc(100%-2rem)] h-[calc(100%-2rem)]",
      },
      variant: {
        default: "bg-background border-border rounded-lg",
        glass: "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-white/20 dark:border-slate-700/30 rounded-xl",
        minimal: "bg-background border-none rounded-lg",
        elevated: "bg-background border-border rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.25)]",
        colorful: "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-indigo-200 dark:border-indigo-900/50 rounded-xl",
      },
      animation: {
        fade: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        zoom: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        slide: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        scale: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:scale-100 data-[state=closed]:scale-95 duration-300",
        rise: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom-10 data-[state=closed]:slide-out-to-bottom-10",
        none: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      animation: "zoom",
    },
  }
);

interface DialogContentProps 
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof contentVariants> {
  overlayClassName?: string;
  overlayVariant?: "default" | "glass" | "frost" | "minimal" | "vibrant";
  showCloseButton?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ 
  className, 
  children, 
  size,
  variant,
  animation,
  overlayClassName,
  overlayVariant = "default",
  showCloseButton = true,
  ...props 
}, ref) => (
  <DialogPortal>
    <DialogOverlay variant={overlayVariant} className={overlayClassName} />
    <DialogPrimitive.Content
      ref={ref}
      className={contentVariants({ size, variant, animation, className })}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogClose className="absolute right-4 top-4 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900 dark:data-[state=open]:bg-slate-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M18 6l-12 12"></path>
            <path d="M6 6l12 12"></path>
          </svg>
          <span className="sr-only">Close</span>
        </DialogClose>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

/* -------------------------------------------------------------------------------------------------
 * Dialog Header - Structural component with enhanced styling
 * -----------------------------------------------------------------------------------------------*/

const headerVariants = cva(
  "flex flex-col",
  {
    variants: {
      align: {
        center: "text-center items-center",
        left: "text-left",
        right: "text-right items-end",
      },
      spacing: {
        tight: "space-y-1",
        default: "space-y-1.5",
        loose: "space-y-3",
      },
      hasDivider: {
        true: "pb-4 mb-4 border-b border-slate-200 dark:border-slate-700/50",
        false: "",
      }
    },
    defaultVariants: {
      align: "left",
      spacing: "default",
      hasDivider: false,
    },
  }
);

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof headerVariants> {}

const DialogHeader = ({
  className,
  align,
  spacing,
  hasDivider,
  ...props
}: DialogHeaderProps) => (
  <div
    className={headerVariants({ align, spacing, hasDivider, className })}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

/* -------------------------------------------------------------------------------------------------
 * Dialog Footer - Structural component with flexible layout options
 * -----------------------------------------------------------------------------------------------*/

const footerVariants = cva(
  "flex mt-auto",
  {
    variants: {
      layout: {
        stack: "flex-col space-y-2",
        row: "flex-row space-x-2",
        spaceBetween: "flex-row justify-between",
        reverseStack: "flex-col-reverse space-y-reverse space-y-2",
        reverseRow: "flex-row-reverse space-x-reverse space-x-2",
      },
      alignment: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
      },
      hasDivider: {
        true: "pt-4 mt-4 border-t border-slate-200 dark:border-slate-700/50",
        false: "",
      }
    },
    defaultVariants: {
      layout: "reverseStack",
      alignment: "end",
      hasDivider: false,
    },
    compoundVariants: [
      {
        layout: ["stack", "reverseStack"],
        alignment: "start",
        className: "items-start",
      },
      {
        layout: ["stack", "reverseStack"],
        alignment: "center",
        className: "items-center",
      },
      {
        layout: ["stack", "reverseStack"],
        alignment: "end",
        className: "items-end",
      },
    ],
  }
);

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof footerVariants> {}

const DialogFooter = ({
  className,
  layout = "row",
  alignment = "end",
  hasDivider,
  ...props
}: DialogFooterProps) => (
  <div
    className={footerVariants({ layout, alignment, hasDivider, className })}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

/* -------------------------------------------------------------------------------------------------
 * Dialog Title & Description - Textual components with enhanced typography
 * -----------------------------------------------------------------------------------------------*/

const titleVariants = cva(
  "leading-tight tracking-tight font-semibold",
  {
    variants: {
      size: {
        sm: "text-base",
        md: "text-lg",
        lg: "text-xl",
        xl: "text-2xl",
      },
      gradient: {
        none: "",
        blue: "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent",
        purple: "bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent",
        cyan: "bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent",
        pink: "bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent",
        amber: "bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent",
      },
    },
    defaultVariants: {
      size: "lg",
      gradient: "none",
    },
  }
);

interface DialogTitleProps 
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>,
    VariantProps<typeof titleVariants> {}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(({ className, size, gradient, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={titleVariants({ size, gradient, className })}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const descriptionVariants = cva(
  "text-muted-foreground",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
      },
    },
    defaultVariants: {
      size: "md",
      weight: "normal",
    },
  }
);

interface DialogDescriptionProps 
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>,
    VariantProps<typeof descriptionVariants> {}

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(({ className, size, weight, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={descriptionVariants({ size, weight, className })}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

/* -------------------------------------------------------------------------------------------------
 * Dialog Body - New convenience component for content section
 * -----------------------------------------------------------------------------------------------*/

const bodyVariants = cva(
  "py-4",
  {
    variants: {
      padding: {
        none: "px-0",
        sm: "px-4",
        md: "px-6",
        lg: "px-8",
      },
      spacing: {
        tight: "space-y-2",
        normal: "space-y-4", 
        loose: "space-y-6",
      },
    },
    defaultVariants: {
      padding: "none",
      spacing: "normal",
    },
  }
);

interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof bodyVariants> {}

const DialogBody = ({
  className,
  padding,
  spacing,
  ...props
}: DialogBodyProps) => (
  <div
    className={bodyVariants({ padding, spacing, className })}
    {...props}
  />
);
DialogBody.displayName = 'DialogBody';

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBody,
};