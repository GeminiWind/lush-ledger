import * as React from "react";
import Image from "next/image";

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  className?: string;
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-[var(--spacing-8)] w-[var(--spacing-8)] text-[length:var(--font-label-sm)]",
  md: "h-[var(--spacing-10)] w-[var(--spacing-10)] text-[length:var(--font-label-md)]",
  lg: "h-[calc(var(--spacing-10)+var(--spacing-2))] w-[calc(var(--spacing-10)+var(--spacing-2))] text-[length:var(--font-body-md)]",
};

export function Avatar({
  src,
  alt = "User avatar",
  initials = "JD",
  size = "md",
  className = "",
}: AvatarProps) {
  return (
    <div
      className={[
        "relative inline-flex items-center justify-center overflow-hidden rounded-full",
        "bg-[var(--color-surface-container-low)] text-[var(--color-primary)]",
        "font-semibold leading-none",
        sizeClasses[size],
        className,
      ].join(" ")}
      aria-label={alt}
      role="img"
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
