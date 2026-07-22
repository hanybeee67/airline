import type { ReactElement } from "react";

export type IconName =
  | "overview"
  | "fleet"
  | "routes"
  | "crew"
  | "finance"
  | "rivals"
  | "events";

const PATHS: Record<IconName, ReactElement> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  fleet: <path d="M21 15l-8-3V5.5a1.5 1.5 0 0 0-3 0V12l-8 3v2l8-2.2V19l-2 1.4V22l3.5-1L15 22.4V21l-2-1.4v-4.2L21 17z" />,
  routes: (
    <>
      <circle cx="5" cy="19" r="2.2" />
      <circle cx="19" cy="5" r="2.2" />
      <path d="M6.5 17.5C10 14 11 8 17.5 6.5" fill="none" strokeWidth="2" strokeDasharray="2 2.5" />
    </>
  ),
  crew: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0z" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M14.5 20a4.6 4.6 0 0 1 6.8-4" fill="none" strokeWidth="2" />
    </>
  ),
  finance: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" strokeWidth="2" />
      <path d="M12 7v10M9.5 9.2c0-1.2 1.1-1.9 2.5-1.9s2.5.8 2.5 2-1 1.7-2.5 1.7-2.5.6-2.5 1.8 1.1 2 2.5 2 2.5-.7 2.5-1.9" fill="none" strokeWidth="1.6" />
    </>
  ),
  rivals: (
    <>
      <path d="M4 20V9l5-3 5 3v11z" />
      <path d="M14 20v-7l5-2 1 2v7z" opacity="0.6" />
    </>
  ),
  events: (
    <>
      <path d="M12 3l9 16H3z" fill="none" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 9v5" strokeWidth="2" />
      <circle cx="12" cy="16.6" r="1" />
    </>
  ),
};

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0"
      aria-hidden="true"
      className="ui-icon"
    >
      {PATHS[name]}
    </svg>
  );
}
