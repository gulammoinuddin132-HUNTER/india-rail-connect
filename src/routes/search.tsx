import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SearchForm } from "@/components/SearchForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration, formatINR, formatTime, dayShort } from "@/lib/format";
import { findStation, STATIONS } from "@/lib/stations";
import { Train, ArrowRight, Clock } from "lucide-react";

const searchSchema = z.object({
  from: z.string().default("NDLS"),
  to: z.string().default("MMCT"),
  date: z.string().default(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10)),
  quota: z.string().default("GN"),
});

export const Route = createFileRoute("/search")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Train Search Results — BharatRail" },
      { name: "description", content: "Trains and fares matching your journey on BharatRail." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

interface TrainClass {
  code: string;
  name: string;
  fare: number;
  seats: number;
}
interface TrainRow {
  id: string;
  number: string;
  name: string;
  train_type: string;
  from_station: string;
  from_code: string;
  to_station: string;
  to_code: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  distance_km: number;
  runs_on: string[];
  classes: TrainClass[];
}

function SearchPage() {
  const { from, to, date, quota } = Route.useSearch();
  const fromStation = findStation(from);
  const toStation = findStation(to);

  const { data: trains, isLoading } = useQuery({
    queryKey: ["trains", from, to, date],
    queryFn: async () => {
      const runsOn = dayShort(date);
      const { data, error } = await supabase
        .from("trains")
        .select("*")
        .eq("from_code", from)
        .eq("to_code", to)
        .contains("runs_on", [runsOn]);
      if (error) throw error;
      return (data ?? []) as unknown as TrainRow[];
    },
  });

  return (
    <>
      {/* Search summary + refine bar */}
      <section className="bg-navy-deep text-navy-foreground">
        <div className="tricolor-bar" />
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-display text-xl font-semibold">
              {fromStation?.city ?? from}
            </span>
            <ArrowRight className="h-4 w-4 text-saffron" />
            <span className="font-display text-xl font-semibold">
              {toStation?.city ?? to}
            </span>
            <span className="chip !border-white/20 !bg-white/10 !text-navy-foreground">
              {new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
            </span>
            <span className="chip !border-white/20 !bg-white/10 !text-navy-foreground">Quota: {quota}</span>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-6 lg:px-6">
          <SearchForm initialFrom={from} initialTo={to} initialDate={date} initialQuota={quota} variant="compact" />
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-card h-32 animate-pulse" />
            ))}
          </div>
        ) : !trains || trains.length === 0 ? (
          <EmptyState from={from} to={to} />
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              {trains.length} train{trains.length === 1 ? "" : "s"} found
            </div>
            <div className="space-y-3">
              {trains.map((t) => (
                <TrainCard key={t.id} train={t} date={date} quota={quota} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}

function TrainCard({ train, date, quota }: { train: TrainRow; date: string; quota: string }) {
  const cheapest = [...train.classes].sort((a, b) => a.fare - b.fare)[0];
  return (
    <div className="surface-card overflow-hidden transition-all hover:border-navy hover:shadow-elevated">
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[1.2fr_2fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-navy text-navy-foreground hover:bg-navy">{train.number}</Badge>
            <Badge variant="outline" className="border-saffron text-saffron">
              {train.train_type}
            </Badge>
          </div>
          <div className="mt-2 font-display text-lg font-bold text-navy-deep">{train.name}</div>
          <div className="mt-1 flex flex-wrap gap-1 text-xs text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span
                key={d}
                className={`inline-flex h-6 w-8 items-center justify-center rounded ${
                  train.runs_on.includes(d)
                    ? "bg-india-green/15 text-india-green"
                    : "bg-muted text-muted-foreground/50 line-through"
                }`}
              >
                {d[0]}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <div className="font-display text-2xl font-bold text-navy-deep">
              {formatTime(train.departure_time)}
            </div>
            <div className="text-xs text-muted-foreground">{train.from_code}</div>
            <div className="text-sm font-medium">{train.from_station}</div>
          </div>
          <div className="flex flex-1 flex-col items-center">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDuration(train.duration_minutes)}
            </div>
            <div className="my-1 flex w-full items-center gap-1">
              <div className="h-px flex-1 bg-border" />
              <Train className="h-4 w-4 text-saffron" />
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {train.distance_km} km
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-navy-deep">
              {formatTime(train.arrival_time)}
            </div>
            <div className="text-xs text-muted-foreground">{train.to_code}</div>
            <div className="text-sm font-medium">{train.to_station}</div>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between gap-3">
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">From</div>
            <div className="font-display text-2xl font-bold text-navy-deep">{formatINR(cheapest.fare)}</div>
            <div className="text-xs text-muted-foreground">per passenger · {cheapest.code}</div>
          </div>
          <Link
            to="/train/$id"
            params={{ id: train.id }}
            search={{ date, quota, class: cheapest.code }}
            className="w-full"
          >
            <Button className="w-full bg-saffron text-saffron-foreground hover:bg-saffron/90">
              View classes
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t bg-secondary/30 px-5 py-3">
        {train.classes.map((c) => (
          <Link
            key={c.code}
            to="/train/$id"
            params={{ id: train.id }}
            search={{ date, quota, class: c.code }}
            className="chip !bg-card !border-border transition-colors hover:!border-saffron hover:!text-saffron"
          >
            <span className="font-semibold">{c.code}</span>
            <span>· {formatINR(c.fare)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ from, to }: { from: string; to: string }) {
  return (
    <div className="surface-card p-12 text-center">
      <Train className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h2 className="mt-4 font-display text-xl font-bold">No direct trains found</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn't find trains from {STATIONS.find(s => s.code === from)?.name ?? from} to {STATIONS.find(s => s.code === to)?.name ?? to} on this day.
        Try a different date or route.
      </p>
      <Link to="/" className="mt-6 inline-block">
        <Button variant="outline">Try a new search</Button>
      </Link>
    </div>
  );
}
