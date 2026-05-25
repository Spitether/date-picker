export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function isoFromYMD(y, m1, d) {
  return `${y}-${pad2(m1)}-${pad2(d)}`;
}

export function isoToYMD(iso) {
  if (!iso) return null;
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

export function formatHuman(iso) {
  const ymd = isoToYMD(iso);
  if (!ymd) return "";
  const { y, m, d } = ymd;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function intervalLabel(value) {
  if (!value) return "";
  const v = String(value).trim().toLowerCase();
  switch (v) {
    case "morning":
    case "morning ☀️":
      return "Morning ☀️";
    case "afternoon":
    case "afternoon 🌤️":
      return "Afternoon 🌤️";
    case "evening":
    case "evening 🌆":
      return "Evening 🌆";
    case "night":
    case "night 🌙":
      return "Night 🌙";
    default:
      return String(value).trim();
  }
}

