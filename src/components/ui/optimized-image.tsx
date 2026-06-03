import { ImgHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** If true, eagerly load (use for above-the-fold LCP images). */
  priority?: boolean;
  /** Aspect ratio class, e.g. "aspect-video". Falls back to width/height attrs. */
  aspectClass?: string;
  /** Wrapper class for sizing/positioning. */
  wrapperClassName?: string;
}

/**
 * Performance-first <img>:
 *   - Explicit width/height (prevents CLS)
 *   - loading="lazy" + decoding="async" by default
 *   - fetchpriority="high" when `priority`
 *   - Blur-up placeholder while loading
 *   - Object-cover by default; pass className to override
 */
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority,
  className,
  aspectClass,
  wrapperClassName,
  ...rest
}: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectClass,
        wrapperClassName,
      )}
      style={aspectClass ? undefined : { aspectRatio: `${width} / ${height}` }}
    >
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-muted/60"
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        // @ts-expect-error - valid HTML attribute, not yet typed
        fetchpriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        {...rest}
      />
    </div>
  );
};

export default OptimizedImage;
