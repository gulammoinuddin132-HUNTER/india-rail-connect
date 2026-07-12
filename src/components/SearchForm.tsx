import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, CalendarIcon, MapPin, Search, Users } from "lucide-react";
import { STATIONS } from "@/lib/stations";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const QUOTAS = [
  { code: "GN", label: "General" },
  { code: "TQ", label: "Tatkal" },
  { code: "LD", label: "Ladies" },
  { code: "SS", label: "Senior Citizen" },
  { code: "PT", label: "Premium Tatkal" },
];

function StationPicker({
  value,
  onChange,
  label,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  icon: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const selected = STATIONS.find((s) => s.code === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group flex w-full flex-col rounded-lg border border-input bg-card px-4 py-3 text-left transition-colors hover:border-primary/50"
        >
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {icon}
            {label}
          </span>
          <span className="mt-1 font-display text-lg font-semibold text-foreground truncate">
            {selected ? selected.name : "Select station"}
          </span>
          <span className="text-xs text-muted-foreground">
            {selected ? `${selected.code} · ${selected.city}` : "Search by name or code"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search station..." />
          <CommandList>
            <CommandEmpty>No station found.</CommandEmpty>
            <CommandGroup>
              {STATIONS.map((s) => (
                <CommandItem
                  key={s.code}
                  value={`${s.code} ${s.name} ${s.city}`}
                  onSelect={() => {
                    onChange(s.code);
                    setOpen(false);
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.city}</div>
                    </div>
                    <span className="chip">{s.code}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function SearchForm({
  initialFrom,
  initialTo,
  initialDate,
  initialQuota,
  variant = "hero",
}: {
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
  initialQuota?: string;
  variant?: "hero" | "compact";
}) {
  const [from, setFrom] = useState(initialFrom ?? "NDLS");
  const [to, setTo] = useState(initialTo ?? "MMCT");
  const [date, setDate] = useState<Date>(
    initialDate ? new Date(initialDate) : new Date(Date.now() + 86400000),
  );
  const [quota, setQuota] = useState(initialQuota ?? "GN");
  const navigate = useNavigate();

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({
      to: "/search",
      search: {
        from,
        to,
        date: format(date, "yyyy-MM-dd"),
        quota,
      },
    });
  }

  return (
    <form onSubmit={submit} className={cn("surface-card p-4 md:p-6", variant === "hero" && "shadow-elevated")}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr_1fr_1fr_auto]">
        <StationPicker value={from} onChange={setFrom} label="From" icon={<MapPin className="h-3 w-3" />} />
        <div className="flex items-center justify-center">
          <Button type="button" variant="outline" size="icon" onClick={swap} className="rounded-full">
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>
        <StationPicker value={to} onChange={setTo} label="To" icon={<MapPin className="h-3 w-3" />} />

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex flex-col rounded-lg border border-input bg-card px-4 py-3 text-left transition-colors hover:border-primary/50"
            >
              <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <CalendarIcon className="h-3 w-3" /> Date of journey
              </span>
              <span className="mt-1 font-display text-lg font-semibold">{format(date, "d MMM")}</span>
              <span className="text-xs text-muted-foreground">{format(date, "EEEE, yyyy")}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              className={cn("p-3 pointer-events-auto")}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <div className="flex flex-col justify-center rounded-lg border border-input bg-card px-4 py-3">
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Users className="h-3 w-3" /> Quota
          </span>
          <Select value={quota} onValueChange={setQuota}>
            <SelectTrigger className="mt-1 h-8 border-0 p-0 font-display text-lg font-semibold focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUOTAS.map((q) => (
                <SelectItem key={q.code} value={q.code}>{q.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-stretch">
          <Button
            type="submit"
            className="h-full w-full bg-saffron px-8 text-saffron-foreground hover:bg-saffron/90 md:w-auto"
          >
            <Search className="mr-2 h-4 w-4" />
            Search Trains
          </Button>
        </div>
      </div>
    </form>
  );
}
