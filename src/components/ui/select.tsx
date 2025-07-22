import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, AnimatePresence } from 'framer-motion';

/* -------------------------------------------------------------------------------------------------
 * Core Primitive Components
 * -----------------------------------------------------------------------------------------------*/

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

/* -------------------------------------------------------------------------------------------------
 * Select Trigger - Enhanced with variants and animations
 * -----------------------------------------------------------------------------------------------*/

const triggerVariants = cva(
  "flex w-full items-center justify-between rounded-md border transition-all duration-200",
  {
    variants: {
    size: {
        xs: "h-7 px-1.5 py-0.5 text-xs",
        sm: "h-8 px-2 py-1 text-xs", 
        md: "h-10 px-3 py-2 text-sm",
        lg: "h-12 px-4 py-3 text-base",
      },
      variant: {
        default: "border-input bg-background placeholder:text-muted-foreground hover:border-slate-400 dark:hover:border-slate-500",
        minimal: "border-transparent bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
        outline: "border-slate-300 dark:border-slate-600 bg-transparent",
        underlined: "border-t-0 border-l-0 border-r-0 border-b-2 border-slate-200 dark:border-slate-700 rounded-none px-1 hover:border-slate-400 dark:hover:border-slate-500",
        ghost: "border-transparent bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800",
        colored: "border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950 hover:border-indigo-300 dark:hover:border-indigo-800",
      },
      isActive: {
        true: "ring-2 ring-ring ring-offset-2 ring-offset-background",
        false: "",
      },
      isDisabled: {
        true: "opacity-50 cursor-not-allowed pointer-events-none",
        false: "",
      },
      isError: {
        true: "border-red-500 dark:border-red-700 text-red-600 dark:text-red-400 placeholder:text-red-400",
        false: "",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
      iconPosition: {
        left: "flex-row-reverse justify-end",
        right: "justify-between",
      },
    },
    compoundVariants: [
      {
        variant: "underlined",
        isActive: true,
        className: "ring-0 ring-offset-0 border-b-indigo-600 dark:border-b-indigo-400",
      },
      {
        variant: "colored",
        isActive: true,
        className: "ring-indigo-200 dark:ring-indigo-800",
      },
    ],
    defaultVariants: {
      size: "md",
      variant: "default",
      isActive: false,
      isDisabled: false,
      isError: false,
      fullWidth: true,
      iconPosition: "right",
    },
  }
);

interface SelectTriggerProps extends 
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
  VariantProps<typeof triggerVariants> {
  leadingIcon?: React.ReactNode;
  errorMessage?: string;
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ 
  className, 
  children, 
  size, 
  variant, 
  isActive, 
  isDisabled,
  isError,
  fullWidth,
  iconPosition,
  leadingIcon,
  errorMessage,
  ...props 
}, ref) => (
  <div className="relative">
    <SelectPrimitive.Trigger
      ref={ref}
      className={triggerVariants({ 
        size, 
        variant, 
        isActive, 
        isDisabled: isDisabled || props.disabled,
        isError,
        fullWidth,
        iconPosition,
        className,
      })}
      {...props}
    >
      {leadingIcon && (
        <span className="mr-2 flex items-center text-slate-500">{leadingIcon}</span>
      )}
      
      {children}
      
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon 
          className={`transition-transform duration-200 data-[state=open]:rotate-180 h-3 w-3
            ${iconPosition === 'left' ? 'mr-0.5' : 'ml-0.5'}`}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    
    {isError && errorMessage && (
      <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
    )}
  </div>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

/* -------------------------------------------------------------------------------------------------
 * Select Content - Enhanced with animations and variants
 * -----------------------------------------------------------------------------------------------*/

const contentVariants = cva(
  "relative z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-popover text-popover-foreground border-slate-200 dark:border-slate-700",
        minimal: "bg-white dark:bg-slate-900 border-transparent shadow-xl",
        floating: "bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl",
        colorful: "bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
      },
      animation: {
        default: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        fade: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        zoom: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        none: "",
      },
      withSeparator: {
        true: "divide-y divide-slate-100 dark:divide-slate-800",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      rounded: "md",
      animation: "default",
      withSeparator: false,
    },
  }
);

interface SelectContentProps extends 
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>,
  VariantProps<typeof contentVariants> {
  containerClassName?: string;
  withSearchFilter?: boolean;
  searchPlaceholder?: string;
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ 
  children, 
  position = "popper", 
  className,
  containerClassName,
  variant,
  size,
  rounded,
  animation,
  withSeparator,
  withSearchFilter,
  searchPlaceholder = "Search...",
  ...props 
}, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={contentVariants({ 
        variant, 
        size, 
        rounded, 
        animation, 
        withSeparator, 
        className,
      })}
      {...props}
    >
      <SelectPrimitive.Viewport className={`p-1 ${containerClassName || ''}`}>
        {withSearchFilter && (
          <div className="px-2 py-1.5 sticky top-0 bg-inherit border-b border-slate-100 dark:border-slate-800">
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              className="w-full bg-transparent border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

/* -------------------------------------------------------------------------------------------------
 * Select Label - Enhanced with variants
 * -----------------------------------------------------------------------------------------------*/

const labelVariants = cva(
  "py-1.5 pr-2 text-sm font-semibold truncate",
  {
    variants: {
      variant: {
        default: "text-slate-700 dark:text-slate-300",
        muted: "text-slate-500 dark:text-slate-400",
        uppercase: "text-slate-600 uppercase text-xs tracking-wider dark:text-slate-400",
        badge: "bg-slate-100 dark:bg-slate-800 rounded-full px-2.5 py-0.5 text-xs",
      },
      position: {
        default: "pl-8",
        left: "pl-8",
        none: "pl-2",
      }
    },
    defaultVariants: {
      variant: "default",
      position: "default",
    },
  }
);

interface SelectLabelProps extends 
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>,
  VariantProps<typeof labelVariants> {}

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  SelectLabelProps
>(({ className, variant, position, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={labelVariants({ variant, position, className })}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

/* -------------------------------------------------------------------------------------------------
 * Select Item - Enhanced with variants and features
 * -----------------------------------------------------------------------------------------------*/

const itemVariants = cva(
  "relative flex w-full cursor-default select-none items-center py-1.5 pr-2 outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        bordered: "border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-md my-0.5",
        highlight: "hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md data-[state=checked]:bg-indigo-50 data-[state=checked]:text-indigo-900 dark:data-[state=checked]:bg-indigo-950 dark:data-[state=checked]:text-indigo-200",
        solid: "data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white",
        subtle: "opacity-70 hover:opacity-100 data-[state=checked]:opacity-100 data-[state=checked]:font-medium",
        ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md",
      },
    size: {
        xs: "py-0.5 text-xs",
        sm: "py-1 text-xs",
        md: "py-1.5 text-sm",
        lg: "py-2 text-base",
      },
      withIcon: {
        true: "pl-8",
        false: "pl-2",
      },
      alignment: {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "xs",
      withIcon: true,
      alignment: "left",
    },
  }
);

interface SelectItemProps extends 
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>,
  VariantProps<typeof itemVariants> {
  description?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ 
  className, 
  children, 
  variant,
  size,
  withIcon, 
  alignment,
  description,
  icon,
  rightElement,
  ...props 
}, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={itemVariants({ variant, size, withIcon, alignment, className })}
    {...props}
  >
    {withIcon && (
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {icon || (
          <SelectPrimitive.ItemIndicator>
            <CheckIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </SelectPrimitive.ItemIndicator>
        )}
      </span>
    )}

    <div className="flex flex-col truncate">
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      {description && (
        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{description}</span>
      )}
    </div>
    
    {rightElement && (
      <span className="ml-auto pl-3 text-slate-500">{rightElement}</span>
    )}
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

/* -------------------------------------------------------------------------------------------------
 * Select Separator - New component for visual grouping
 * -----------------------------------------------------------------------------------------------*/

const separatorVariants = cva(
  "mx-1 my-1 h-px",
  {
    variants: {
      variant: {
        default: "bg-slate-200 dark:bg-slate-700",
        faded: "bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700",
        dashed: "border-t border-dashed border-slate-200 dark:border-slate-700 bg-transparent h-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface SelectSeparatorProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof separatorVariants> {}

const SelectSeparator = ({
  className,
  variant,
  ...props
}: SelectSeparatorProps) => (
  <div
    className={separatorVariants({ variant, className })}
    {...props}
  />
);
SelectSeparator.displayName = 'SelectSeparator';

/* -------------------------------------------------------------------------------------------------
 * Icons - Enhanced SVG components
 * -----------------------------------------------------------------------------------------------*/

const ChevronDownIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>((props, ref) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5 opacity-50"
    ref={ref}
    {...props}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
));
ChevronDownIcon.displayName = 'ChevronDownIcon';

const CheckIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>((props, ref) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    ref={ref}
    {...props}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
));
CheckIcon.displayName = 'CheckIcon';

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
