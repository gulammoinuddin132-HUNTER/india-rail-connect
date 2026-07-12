import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, ArrowRight, Train as TrainIcon, Clock } from "lucide-react";
import { formatDuration, formatINR, formatTime, generatePNR } from "@/lib/format";

const searchSchema = z.object({
  date: z.string(),
  quota: z.string().default("GN"),
  class: z.string().default("3A"),
});

export const Route = createFileRoute("/train/$id")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Train Details — BharatRail" }, { name: "robots", content: "noindex" }] }),
  component: TrainDetail,
});

interface TrainClass { code: string; name: string; fare: number; seats: number; }
interface TrainRow {
  id: string; number: string; name: string; train_type: string;
  from_station: string; from_code: string; to_station: string; to_code: string;
  departure_time: string; arrival_time: string; duration_minutes: number; distance_km: number;
  runs_on: string[]; classes: TrainClass[];
}
interface Passenger { name: string; age: string; gender: "M" | "F" | "O"; berth: string; }

function TrainDetail() {
  const { id } = Route.useParams();
  const { date, quota, class: initialClass } = Route.useSearch();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: "", age: "", gender: "M", berth: "NA" },
  ]);
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: train, isLoading } = useQuery({
    queryKey: ["train", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("trains").select("*").eq("id", id).single();
      if (error) throw error;
      return data as unknown as TrainRow;
    },
  });

  if (isLoading) return <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6"><div className="surface-card h-64 animate-pulse" /></div>;
  if (!train) return <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">Train not found.</div>;

  const cls = train.classes.find((c) => c.code === selectedClass) ?? train.classes[0];
  const totalFare = cls.fare * passengers.length;

  function updatePassenger(i: number, patch: Partial<Passenger>) {
    setPassengers((p) => p.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addPassenger() {
    if (passengers.length >= 6) return toast.error("Maximum 6 passengers per booking.");
    setPassengers((p) => [...p, { name: "", age: "", gender: "M", berth: "NA" }]);
  }
  function removePassenger(i: number) {
    if (passengers.length === 1) return;
    setPassengers((p) => p.filter((_, idx) => idx !== i));
  }

  async function handleBook() {
    if (!isAuthenticated || !user) {
      toast.info("Please sign in to book this ticket.");
      navigate({ to: "/auth", search: { redirect: `/train/${id}?date=${date}&quota=${quota}&class=${selectedClass}` } });
      return;
    }
    for (const p of passengers) {
      if (!p.name.trim() || !p.age.trim()) {
        toast.error("Enter name and age for every passenger.");
        return;
      }
      const age = parseInt(p.age);
      if (isNaN(age) || age < 1 || age > 120) {
        toast.error("Enter a valid age.");
        return;
      }
    }
    if (!contactEmail.trim() || !contactPhone.trim()) {
      toast.error("Contact email and phone are required.");
      return;
    }

    setSubmitting(true);
    try {
      const pnr = generatePNR();
      const { data: booking, error: bErr } = await supabase
        .from("bookings")
        .insert({
          pnr,
          user_id: user.id,
          train_id: train.id,
          train_number: train.number,
          train_name: train.name,
          from_station: train.from_station,
          from_code: train.from_code,
          to_station: train.to_station,
          to_code: train.to_code,
          journey_date: date,
          departure_time: train.departure_time,
          arrival_time: train.arrival_time,
          class_code: cls.code,
          class_name: cls.name,
          quota,
          total_fare: totalFare,
          booking_status: "PENDING",
          payment_status: "PENDING",
          contact_email: contactEmail,
          contact_phone: contactPhone,
        })
        .select()
        .single();
      if (bErr) throw bErr;

      const passengerRows = passengers.map((p, i) => {
        // Simulate seat allocation. First 80% CNF, rest WL for realism.
        const status = i < Math.ceil(passengers.length * 0.85) ? "CNF" : "WL";
        return {
          booking_id: booking.id,
          name: p.name.trim(),
          age: parseInt(p.age),
          gender: p.gender,
          berth_preference: p.berth,
          coach: status === "CNF" ? `${cls.code[0]}${Math.floor(Math.random() * 4) + 1}` : null,
          seat_no: status === "CNF" ? String(Math.floor(Math.random() * 60) + 1) : `WL/${i}`,
          status,
        };
      });
      const { error: pErr } = await supabase.from("booking_passengers").insert(passengerRows);
      if (pErr) throw pErr;

      toast.success("Booking created. Proceed to payment.");
      navigate({ to: "/checkout/$bookingId", params: { bookingId: booking.id } });
    } catch (e) {
      console.error(e);
      toast.error("Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
      {/* Header */}
      <Card className="mb-6 overflow-hidden p-0">
        <div className="bg-navy-deep p-6 text-navy-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-saffron text-saffron-foreground hover:bg-saffron">{train.number}</Badge>
            <Badge variant="outline" className="border-white/30 text-navy-foreground">{train.train_type}</Badge>
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold">{train.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div>
              <div className="font-display text-3xl font-bold">{formatTime(train.departure_time)}</div>
              <div className="text-sm text-navy-foreground/70">{train.from_station} ({train.from_code})</div>
            </div>
            <div className="flex flex-col items-center px-4">
              <div className="text-xs text-navy-foreground/70">
                <Clock className="mr-1 inline h-3 w-3" />
                {formatDuration(train.duration_minutes)}
              </div>
              <ArrowRight className="my-1 h-4 w-4 text-saffron" />
              <div className="text-xs text-navy-foreground/70">{train.distance_km} km</div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold">{formatTime(train.arrival_time)}</div>
              <div className="text-sm text-navy-foreground/70">{train.to_station} ({train.to_code})</div>
            </div>
          </div>
          <div className="mt-3 text-sm text-navy-foreground/80">
            Journey date: <span className="font-semibold">{new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left */}
        <div className="space-y-6">
          {/* Class selection */}
          <Card className="p-5">
            <div className="mb-3 font-display text-lg font-bold">Select class</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {train.classes.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelectedClass(c.code)}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    selectedClass === c.code
                      ? "border-saffron bg-saffron/5 shadow-card"
                      : "border-border hover:border-navy"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="chip">{c.code}</span>
                    <span className="text-xs text-india-green">Avail</span>
                  </div>
                  <div className="mt-2 font-medium">{c.name}</div>
                  <div className="font-display text-xl font-bold text-navy-deep">{formatINR(c.fare)}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Passengers */}
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="font-display text-lg font-bold">Passenger details</div>
                <div className="text-xs text-muted-foreground">Up to 6 passengers per booking</div>
              </div>
              <Button variant="outline" size="sm" onClick={addPassenger}>
                <Plus className="mr-1 h-3 w-3" /> Add passenger
              </Button>
            </div>
            <div className="space-y-3">
              {passengers.map((p, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-secondary/30 p-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                  <Input
                    placeholder="Full name (as per ID)"
                    value={p.name}
                    onChange={(e) => updatePassenger(i, { name: e.target.value })}
                    maxLength={60}
                  />
                  <Input
                    type="number" min={1} max={120} placeholder="Age"
                    value={p.age}
                    onChange={(e) => updatePassenger(i, { age: e.target.value })}
                  />
                  <Select value={p.gender} onValueChange={(v) => updatePassenger(i, { gender: v as Passenger["gender"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="O">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={p.berth} onValueChange={(v) => updatePassenger(i, { berth: v })}>
                    <SelectTrigger><SelectValue placeholder="Berth" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NA">No preference</SelectItem>
                      <SelectItem value="LB">Lower</SelectItem>
                      <SelectItem value="MB">Middle</SelectItem>
                      <SelectItem value="UB">Upper</SelectItem>
                      <SelectItem value="SL">Side Lower</SelectItem>
                      <SelectItem value="SU">Side Upper</SelectItem>
                      <SelectItem value="WS">Window</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => removePassenger(i)}
                    disabled={passengers.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-5">
            <div className="mb-3 font-display text-lg font-bold">Contact details</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} maxLength={200} />
              </div>
              <div>
                <Label htmlFor="phone">Mobile</Label>
                <Input id="phone" type="tel" placeholder="10-digit mobile" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} maxLength={15} />
              </div>
            </div>
          </Card>
        </div>

        {/* Right — Fare summary */}
        <div>
          <Card className="sticky top-24 p-5">
            <div className="font-display text-lg font-bold">Fare summary</div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Class</span>
                <span className="font-medium">{cls.name} ({cls.code})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base fare × {passengers.length}</span>
                <span className="font-medium">{formatINR(cls.fare * passengers.length)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reservation charge</span>
                <span className="font-medium">Included</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST</span>
                <span className="font-medium">Included</span>
              </div>
              <div className="my-3 border-t" />
              <div className="flex justify-between">
                <span className="font-display text-base font-semibold">Total</span>
                <span className="font-display text-2xl font-bold text-navy-deep">{formatINR(totalFare)}</span>
              </div>
            </div>
            <Button
              onClick={handleBook}
              disabled={submitting}
              className="mt-4 w-full bg-saffron text-saffron-foreground hover:bg-saffron/90"
            >
              {submitting ? "Creating booking..." : isAuthenticated ? "Proceed to payment" : "Sign in to book"}
            </Button>
            <div className="mt-3 text-[11px] text-muted-foreground">
              By continuing you agree to the terms of BharatRail. This is a demo — no real
              ticket will be issued.
            </div>
            {!isAuthenticated && (
              <div className="mt-2 text-xs text-muted-foreground">
                Don't have an account? <Link to="/auth" className="text-saffron underline">Create one</Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
