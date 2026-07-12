import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Search, ArrowRight } from "lucide-react";
import { formatTime, formatINR, formatDate, statusColor } from "@/lib/format";

export const Route = createFileRoute("/pnr")({
  head: () => ({
    meta: [
      { title: "PNR Status — BharatRail" },
      { name: "description", content: "Check your Indian Railways PNR status instantly." },
    ],
  }),
  component: PnrPage,
});

interface Booking {
  id: string; pnr: string; train_number: string; train_name: string;
  from_station: string; from_code: string; to_station: string; to_code: string;
  journey_date: string; departure_time: string; arrival_time: string;
  class_code: string; class_name: string; quota: string; total_fare: number;
  booking_status: string; payment_status: string;
}
interface Passenger { id: string; name: string; age: number; gender: string; coach: string | null; seat_no: string | null; status: string; }

function PnrPage() {
  const [pnr, setPnr] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBooking(null);
    setPassengers([]);
    try {
      const { data: b, error: bErr } = await supabase
        .from("bookings").select("*").eq("pnr", pnr.trim()).maybeSingle();
      if (bErr) throw bErr;
      if (!b) {
        setError("No booking found for this PNR.");
        return;
      }
      setBooking(b as Booking);
      const { data: pax } = await supabase
        .from("booking_passengers").select("*").eq("booking_id", b.id).order("created_at");
      setPassengers((pax ?? []) as Passenger[]);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-6">
      <div className="mb-6 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-navy text-navy-foreground">
          <Ticket className="h-6 w-6" />
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy-deep">PNR Status</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your 10-digit PNR to check the current status.</p>
      </div>

      <Card className="p-5">
        <form onSubmit={lookup} className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Enter 10-digit PNR"
            value={pnr}
            onChange={(e) => setPnr(e.target.value)}
            maxLength={10}
            className="text-lg tracking-widest"
          />
          <Button type="submit" disabled={loading || pnr.length !== 10} className="bg-saffron text-saffron-foreground hover:bg-saffron/90">
            <Search className="mr-2 h-4 w-4" /> {loading ? "Checking..." : "Check status"}
          </Button>
        </form>
        {error && <div className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      </Card>

      {booking && (
        <Card className="mt-6 overflow-hidden p-0">
          <div className="bg-navy-deep p-5 text-navy-foreground">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-widest text-navy-foreground/70">PNR</div>
                <div className="font-display text-2xl font-bold tracking-widest">{booking.pnr}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-saffron text-saffron-foreground hover:bg-saffron">{booking.train_number}</Badge>
                <Badge variant="outline" className="border-white/30 text-navy-foreground">{booking.class_code}</Badge>
                <Badge variant="outline" className="border-white/30 text-navy-foreground">{booking.quota}</Badge>
              </div>
            </div>
            <div className="mt-3 font-display text-lg font-semibold">{booking.train_name}</div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <div>
                <div className="font-display text-xl font-bold">{formatTime(booking.departure_time)}</div>
                <div className="text-xs text-navy-foreground/70">{booking.from_station} · {booking.from_code}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-saffron" />
              <div>
                <div className="font-display text-xl font-bold">{formatTime(booking.arrival_time)}</div>
                <div className="text-xs text-navy-foreground/70">{booking.to_station} · {booking.to_code}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-navy-foreground/70">Journey date</div>
                <div className="font-semibold">{formatDate(booking.journey_date)}</div>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-display text-lg font-bold">Passengers</div>
              <div className="text-sm">
                Payment: <Badge variant={booking.payment_status === "PAID" ? "default" : "outline"} className={booking.payment_status === "PAID" ? "bg-india-green text-india-green-foreground" : ""}>{booking.payment_status}</Badge>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2">#</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Age/Gender</th>
                    <th className="py-2">Coach/Seat</th>
                    <th className="py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.map((p, i) => (
                    <tr key={p.id} className="border-t">
                      <td className="py-2">{i + 1}</td>
                      <td className="py-2 font-medium">{p.name}</td>
                      <td className="py-2">{p.age} / {p.gender}</td>
                      <td className="py-2 font-mono">{p.coach ? `${p.coach}·${p.seat_no}` : p.seat_no ?? "-"}</td>
                      <td className="py-2 text-right">
                        <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${statusColor(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <div className="text-sm text-muted-foreground">Total fare</div>
              <div className="font-display text-xl font-bold text-navy-deep">{formatINR(booking.total_fare)}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don't have a booking yet? <Link to="/" className="text-saffron underline">Book a ticket</Link>
      </div>
    </div>
  );
}
