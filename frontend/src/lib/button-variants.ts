import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-muted hover:bg-primary/90 cursor-pointer",
        destructive:
          "border border-destructive  bg-transparent text-destructive  hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 cursor-pointer",
        outline:
          "border border-primary bg-foreground  dark:bg-foreground text-primary dark:border-primary dark:hover:bg-foreground/80 cursor-pointer",
        secondary:
          "bg-transparent border border-border text-muted-foreground hover:bg--muted-foreground  cursor-pointer",
        ghost:
          "hover:bg-ghost hover:text-muted-foreground  dark:hover:bg-ghost/50 cursor-pointer",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3 cursor-pointer",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 cursor-pointer",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4 cursor-pointer",
        icon: "size-9 cursor-pointer",
        "icon-sm": "size-8 cursor-pointer",
        "icon-lg": "size-10 cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
