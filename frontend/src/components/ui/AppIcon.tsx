import type { SVGProps } from "react";
import { cn } from "../../lib/cn";
import type { IconName } from "../../types/ui";

type AppIconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  filled?: boolean;
};

function AppIcon({ className, filled = false, name, ...props }: AppIconProps) {
  const commonProps = {
    className: cn("h-5 w-5", className),
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    ...props,
  };

  switch (name) {
    case "grid":
      return (
        <svg {...commonProps}>
          <rect x="3" y="3" width="8" height="8" rx="2" fill={filled ? "currentColor" : "none"} />
          <rect x="13" y="3" width="8" height="8" rx="2" />
          <rect x="3" y="13" width="8" height="8" rx="2" />
          <rect x="13" y="13" width="8" height="8" rx="2" fill={filled ? "currentColor" : "none"} />
        </svg>
      );
    case "add-circle":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" fill={filled ? "currentColor" : "none"} />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );
    case "history":
      return (
        <svg {...commonProps}>
          <path d="M4 12a8 8 0 1 0 2.34-5.66" />
          <path d="M4 4v4h4" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    case "settings":
      return (
        <svg {...commonProps}>
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
          <path d="m5.64 5.64 2.12 2.12" />
          <path d="m16.24 16.24 2.12 2.12" />
          <path d="m18.36 5.64-2.12 2.12" />
          <path d="m7.76 16.24-2.12 2.12" />
          <circle cx="12" cy="12" r="3.5" fill={filled ? "currentColor" : "none"} />
        </svg>
      );
    case "bell":
      return (
        <svg {...commonProps}>
          <path d="M15 17H9c-1.1 0-2-.9-2-2v-3a5 5 0 1 1 10 0v3c0 1.1-.9 2-2 2Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );
    case "plus":
      return (
        <svg {...commonProps}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "trend-up":
      return (
        <svg {...commonProps}>
          <path d="m4 15 5-5 4 4 7-7" />
          <path d="M14 7h6v6" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...commonProps}>
          <path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7Z" />
          <path d="m5 16 .8 2 .2.2 2 .8-2 .8-.2.2-.8 2-.8-2-.2-.2-2-.8 2-.8.2-.2Z" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...commonProps}>
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M8 3v4" />
          <path d="M16 3v4" />
          <path d="M3 10h18" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...commonProps}>
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
          <path d="M16 13h4" />
          <circle cx="16" cy="13" r="1" fill="currentColor" />
        </svg>
      );
    case "shopping-bag":
      return (
        <svg {...commonProps}>
          <path d="M6 8h12l-1 11H7L6 8Z" />
          <path d="M9 8a3 3 0 0 1 6 0" />
        </svg>
      );
    case "receipt":
      return (
        <svg {...commonProps}>
          <path d="M7 3h10v18l-2-1.5L13 21l-2-1.5L9 21l-2-1.5L5 21V5a2 2 0 0 1 2-2Z" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
          <path d="M9 16h4" />
        </svg>
      );
    case "close":
      return (
        <svg {...commonProps}>
          <path d="m6 6 12 12" />
          <path d="M18 6 6 18" />
        </svg>
      );
    case "arrow-up":
      return (
        <svg {...commonProps}>
          <path d="M12 19V5" />
          <path d="m6 11 6-6 6 6" />
        </svg>
      );
    case "arrow-down":
      return (
        <svg {...commonProps}>
          <path d="M12 5v14" />
          <path d="m18 13-6 6-6-6" />
        </svg>
      );
    case "tag":
      return (
        <svg {...commonProps}>
          <path d="M20 10 10 20l-7-7L13 3h7Z" />
          <circle cx="16.5" cy="7.5" r="1" fill="currentColor" />
        </svg>
      );
    case "edit":
      return (
        <svg {...commonProps}>
          <path d="M12 20h9" />
          <path d="m16.5 3.5 4 4L8 20l-4 1 1-4Z" />
        </svg>
      );
    case "document":
      return (
        <svg {...commonProps}>
          <path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M14 3v5h5" />
        </svg>
      );
    case "heart":
      return (
        <svg {...commonProps}>
          <path d="m12 20-1.4-1.27C5.4 14 2 10.9 2 7.09A4.09 4.09 0 0 1 6.09 3 4.5 4.5 0 0 1 12 6.09 4.5 4.5 0 0 1 17.91 3 4.09 4.09 0 0 1 22 7.09c0 3.81-3.4 6.91-8.6 11.64Z" />
        </svg>
      );
    case "chat":
      return (
        <svg {...commonProps}>
          <path d="M6 17.5 3 21V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6Z" />
          <path d="M8 10h8" />
          <path d="M8 14h5" />
        </svg>
      );
    case "logout":
      return (
        <svg {...commonProps}>
          <path d="M15 17 20 12 15 7" />
          <path d="M20 12H9" />
          <path d="M11 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5" />
        </svg>
      );
    case "trash":
      return (
        <svg {...commonProps}>
          <path d="M4 7h16" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M6 7l1 13h10l1-13" />
          <path d="M9 7V4h6v3" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...commonProps}>
          <rect x="3" y="7" width="18" height="12" rx="2" />
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "user":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );
    case "sale":
      return (
        <svg {...commonProps}>
          <path d="m4 12 8-8 8 8-8 8Z" />
          <circle cx="12" cy="12" r="2" fill={filled ? "currentColor" : "none"} />
        </svg>
      );
    case "box":
      return (
        <svg {...commonProps}>
          <path d="m12 3 8 4.5v9L12 21 4 16.5v-9Z" />
          <path d="m4 7.5 8 4.5 8-4.5" />
          <path d="M12 12v9" />
        </svg>
      );
    case "filter_list":
      return (
        <svg {...commonProps}>
          <path d="M3 6h18" />
          <path d="M7 12h10" />
          <path d="M10 18h4" />
        </svg>
      );
    default:
      return null;
  }
}

export default AppIcon;
