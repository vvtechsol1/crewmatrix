import Image from "next/image";
import clsx from "clsx";

export function BrandLogo({
  className,
  imageClassName = "size-10",
  textClassName,
  showText = true,
  priority = false,
}: {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
  priority?: boolean;
}) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/brand/crewmatrix-monogram.png"
        alt=""
        width={48}
        height={48}
        priority={priority}
        className={clsx("shrink-0 object-contain", imageClassName)}
      />
      {showText && (
        <span className={clsx("font-display font-bold tracking-[-.035em]", textClassName)}>
          CrewMatrix
        </span>
      )}
    </span>
  );
}
