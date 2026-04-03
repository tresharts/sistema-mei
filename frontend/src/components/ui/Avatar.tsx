import { cn } from "../../lib/cn";

type AvatarProps = {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-20 w-20 text-lg",
} as const;

function Avatar({ className, initials, size = "md" }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border border-primary/15 bg-primary-container/65 font-headline font-extrabold uppercase text-primary",
        sizeMap[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}

export default Avatar;
