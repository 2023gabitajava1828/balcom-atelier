import { cva } from "class-variance-authority";

// Base styles with hover lift effect
const baseStyles = [
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl",
  "text-sm font-medium",
  "transition-all duration-300 ease-luxury",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:pointer-events-none disabled:opacity-50",
  "active:scale-[0.98]",
].join(" ");

export const luxuryButtonVariants = cva(baseStyles, {
  variants: {
    variant: {
      default: [
        "bg-primary text-primary-foreground",
        "hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-gold",
      ].join(" "),
      destructive: [
        "bg-destructive text-destructive-foreground",
        "hover:bg-destructive/90 hover:-translate-y-0.5",
      ].join(" "),
      outline: [
        "border-2 border-primary bg-transparent text-primary",
        "hover:bg-primary/10 hover:-translate-y-0.5 hover:border-primary/80",
      ].join(" "),
      secondary: [
        "bg-secondary text-secondary-foreground",
        "hover:bg-secondary/80 hover:-translate-y-0.5",
      ].join(" "),
      ghost: [
        "text-foreground",
        "hover:bg-accent hover:text-accent-foreground",
      ].join(" "),
      link: "text-primary underline-offset-4 hover:underline",
      hero: [
        "gradient-gold text-primary-foreground shadow-deep",
        "hover:opacity-95 hover:-translate-y-1 hover:shadow-gold",
        "text-base font-semibold",
      ].join(" "),
      premium: [
        "bg-muted text-foreground border-2 border-primary/30",
        "hover:border-primary hover:bg-muted/80 hover:-translate-y-0.5",
        "shadow-gold",
      ].join(" "),
    },
    size: {
      default: "h-12 px-6 py-3",
      sm: "h-10 px-4 text-sm",
      lg: "h-14 px-8 text-base",
      xl: "h-16 px-10 text-lg",
      icon: "h-12 w-12",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
