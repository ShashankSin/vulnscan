import React, { useState, forwardRef, memo } from "react";
import { cn } from "../../lib/utils";

const RoundedVariants = {
  none: "",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
} as const;

type RoundedVariant = keyof typeof RoundedVariants;

const ObjectFitVariants = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
  none: "object-none",
  scaleDown: "object-scale-down",
} as const;

type ObjectFitVariant = keyof typeof ObjectFitVariants;

interface AppImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  rounded?: RoundedVariant;
  objectFit?: ObjectFitVariant;
  clickable?: boolean;
  maxWidth?: string; // optional max width, like 'max-w-sm'
}

const AppImage = memo(
  forwardRef<HTMLImageElement, AppImageProps>(
    (
      {
        src,
        alt,
        fallback = "/placeholder.png",
        rounded = "md",
        objectFit = "cover",
        clickable = false,
        className,
        loading = "lazy",
        maxWidth,
        ...props
      },
      ref,
    ) => {
      const [imgSrc, setImgSrc] = useState(src);

      return (
        <img
          ref={ref}
          src={imgSrc}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => {
            if (fallback && imgSrc !== fallback) {
              setImgSrc(fallback);
            }
          }}
          className={cn(
            "select-none transition-opacity duration-300 w-full h-auto",
            RoundedVariants[rounded],
            ObjectFitVariants[objectFit],
            clickable && "cursor-pointer hover:opacity-90",
            maxWidth, // optional Tailwind max-width
            className,
          )}
          {...props}
        />
      );
    },
  ),
);

AppImage.displayName = "AppImage";
export default AppImage;
