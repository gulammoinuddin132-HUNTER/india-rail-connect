export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export function formatTime(t: string): string {
  // Postgres TIME comes back as "HH:MM:SS"
  return t.slice(0, 5);
}

export function formatINR(n: number | string): string {
  const num = typeof n === "string" ? parseFloat(n) : n;
  return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function shortDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

const DAY_MAP = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function dayShort(dateStr: string): string {
  return DAY_MAP[new Date(dateStr).getDay()];
}

export function generatePNR(): string {
  // 10-digit PNR like real IRCTC
  let s = "";
  for (let i = 0; i < 10; i++) s += Math.floor(Math.random() * 10);
  return s;
}

export function quotaLabel(code: string): string {
  return (
    {
      GN: "General",
      TQ: "Tatkal",
      LD: "Ladies",
      SS: "Senior Citizen",
      PT: "Premium Tatkal",
    }[code] ?? code
  );
}

export function statusColor(status: string): string {
  if (status === "CNF") return "bg-india-green text-india-green-foreground";
  if (status === "RAC") return "bg-gold text-navy-deep";
  if (status === "WL") return "bg-destructive text-destructive-foreground";
  return "bg-muted text-muted-foreground";
}
