import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
  as?: "h1" | "h2";
}

/**
 * Site-wide section heading — matches the hero style:
 * dash-prefixed uppercase eyebrow, Fraunces display headline, muted subheading.
 */
const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
  titleClassName,
  as = "h2",
}: Props) => {
  const Tag = as;
  const isCenter = align === "center";
  return (
    <div
      className={cn(
        isCenter ? "text-center mx-auto" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-primary",
          )}
        >
          <span className="h-px w-6 bg-primary" />
          {eyebrow}
        </div>
      )}
      <Tag
        className={cn(
          "mt-6 font-display text-[2.5rem] md:text-6xl lg:text-[4.25rem] leading-[1.02] tracking-tight text-foreground",
          isCenter ? "max-w-[18ch] mx-auto" : "max-w-[18ch]",
          titleClassName,
        )}
      >
        {title}
      </Tag>
      {subtitle && (
        <p
          className={cn(
            "mt-6 md:mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed",
            isCenter && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
