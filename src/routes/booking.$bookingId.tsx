import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Download, Printer, Train as TrainIcon, XCircle } from "lucide-react";
import { formatDate, formatINR, formatTime, statusColor } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/booking/$bookingId")({
  head: () => ({ meta: [{ title: "E-Ticket — BharatRail" }, { name: "robots", content: "noindex" }] }),
  component: BookingDetail,
});

function BookingDetail() {
  const { bookingId } = Route.useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate({ to: "/auth", search: { redirect: `/booking/${bookingId}` } });
  }, [authLoading, isAuthenticated, bookingId, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      const { data: b } = await supabase.from("bookings").select("*").eq("id", bookingId).maybeSingle();
      setBooking(b);
      if (b) {
        const { data: p } = await supabase.from("booking_passengers").select("*").eq("booking_id", b.id).order("created_at");
        setPassengers(p ?? []);
      }
      setLoading(false);
    })();
  }, [bookingId, isAuthenticated]);

  async function cancelBooking() {
    if (!booking) return;
    if (!confirm("Cancel this booking? Refund will be processed as per rules.")) return;
    const { error } = await supabase
      .from("bookings")
      .update({ booking_status: "CANCELLED", payment_status: booking.payment_status === "PAID" ? "REFUNDED" : booking.payment_status })
      .eq("id", booking.id);
    if (error) return toast.error("Cancel failed.");
    await supabase.from("booking_passengers").update({ status: "CAN" }).eq("booking_id", booking.id);
    toast.success("Booking cancelled.");
    setBooking({ ...booking, booking_status: "CANCELLED" });
    setPassengers((prev) => prev.map((p) => ({ ...p, status: "CAN" })));
  }

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-10 lg:px-6"><div className="surface-card h-64 animate-pulse" /></div>;
  if (!booking) return <div className="mx-auto max-w-4xl px-4 py-10 lg:px-6">Booking not found.</div>;

  const isConfirmed = booking.booking_status === "CONFIRMED";
  const isCancelled = booking.booking_status === "CANCELLED";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 print:py-4 lg:px-6">
      {isConfirmed && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-india-green/10 p-3 text-sm text-india-green print:hidden">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold">Booking confirmed.</span> Your e-ticket has been generated below.
        </div>
      )}
      {isCancelled && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive print:hidden">
          <XCircle className="h-5 w-5" />
          <span className="font-semibold">This booking has been cancelled.</span>
        </div>
      )}

      <Card className="overflow-hidden p-0">
        {/* Ticket header */}
        <div className="tricolor-bar" />
        <div className="bg-navy-deep p-5 text-navy-foreground">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-navy-foreground/70">
                <TrainIcon className="h-4 w-4" /> BharatRail · E-Ticket
              </div>
              <div className="mt-1 font-display text-2xl font-bold">{booking.train_name}</div>
              <div className="text-sm text-navy-foreground/80">{booking.train_number}</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-navy-foreground/70">PNR</div>
              <div className="font-display text-2xl font-bold tracking-widest">{booking.pnr}</div>
              <div className="mt-1 flex gap-2">
                <Badge variant="outline" className="border-white/30 text-navy-foreground">{booking.class_code}</Badge>
                <Badge variant="outline" className="border-white/30 text-navy-foreground">{booking.quota}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 rounded-lg bg-white/5 p-4 sm:grid-cols-[1fr_auto_1fr]">
            <div>
              <div className="text-xs text-navy-foreground/70">From</div>
              <div className="font-display text-xl font-bold">{formatTime(booking.departure_time)}</div>
              <div className="text-sm">{booking.from_station}</div>
              <div className="text-xs text-navy-foreground/70">{booking.from_code}</div>
            </div>
            <ArrowRight className="hidden self-center text-saffron sm:block" />
            <div className="sm:text-right">
              <div className="text-xs text-navy-foreground/70">To</div>
              <div className="font-display text-xl font-bold">{formatTime(booking.arrival_time)}</div>
              <div className="text-sm">{booking.to_station}</div>
              <div className="text-xs text-navy-foreground/70">{booking.to_code}</div>
            </div>
          </div>

          <div className="mt-3 text-sm">
            Date of journey: <span className="font-semibold">{formatDate(booking.journey_date)}</span>
          </div>
        </div>

        {/* Passenger table */}
        <div className="p-5">
          <div className="font-display text-lg font-bold">Passenger list</div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2">#</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Age/Gender</th>
                  <th className="py-2">Coach · Seat</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((p, i) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2">{i + 1}</td>
                    <td className="py-2 font-medium">{p.name}</td>
                    <td className="py-2">{p.age} / {p.gender}</td>
                    <td className="py-2 font-mono">{p.coach ? `${p.coach} · ${p.seat_no}` : p.seat_no ?? "-"}</td>
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

          <div className="mt-5 grid grid-cols-1 gap-3 rounded-lg bg-secondary/40 p-4 text-sm sm:grid-cols-3">
            <div>
              <div className="text-xs text-muted-foreground">Total fare</div>
              <div className="font-display text-xl font-bold text-navy-deep">{formatINR(booking.total_fare)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Payment</div>
              <div className="font-semibold">{booking.payment_status} {booking.payment_method ? `· ${booking.payment_method}` : ""}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Booking status</div>
              <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${statusColor(booking.booking_status)}`}>
                {booking.booking_status}
              </span>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Please carry a valid photo ID during the journey. This is a demonstration ticket
            and cannot be used for actual travel on Indian Railways.
          </div>
        </div>
      </Card>

      <div className="mt-4 flex flex-wrap items-center gap-2 print:hidden">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
        <Button variant="outline" asChild>
          <Link to="/bookings">Back to bookings</Link>
        </Button>
        {isConfirmed && (
          <Button variant="destructive" className="ml-auto" onClick={cancelBooking}>
            Cancel booking
          </Button>
        )}
      </div>
    </div>
  );
}
