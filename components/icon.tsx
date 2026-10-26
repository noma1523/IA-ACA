import type { CSSProperties } from "react";
const paths: Record<string, string> = {
  home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  book: "M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H3V4Zm9 3a3 3 0 0 1 3-3h5v15h-5a3 3 0 0 0-3 2",
  grid: "M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m18 0v-2a4 4 0 0 0-3-3.87M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 0a4 4 0 0 1 0 8",
  card: "M3 5h18v14H3ZM3 10h18m-14 5h4",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  check: "m5 12 4 4L19 6",
  lock: "M5 10h14v11H5Zm3 0V7a4 4 0 0 1 8 0v3m-4 4v3",
  trophy:
    "M8 3h8v7a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 2v7m-4 0h8",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M6 18 18 6",
  search: "M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm5.5 13 5 5",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2",
  play: "m9 5 11 7-11 7Z",
  logout: "M9 4H4v16h5m5-13 5 5-5 5m-6-5h11",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z",
  shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-6",
  bookmark: "M6 3h12v18l-6-4-6 4Z",
  chat: "M4 4h16v13H9l-5 4Z",
  mail: "M3 5h18v14H3Zm0 0 9 8 9-8",
  chart: "M4 20h17M7 16v-5m6 5V5m6 11V8",
  cap: "m2 9 10-5 10 5-10 5Zm4 2v6q6 5 12 0v-6m4-2v8",
};
export function Icon({
  name,
  size = 20,
  style,
  className = "",
}: {
  name: string;
  size?: number;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
      className={className}
    >
      <path d={paths[name] || paths.spark} />
    </svg>
  );
}
