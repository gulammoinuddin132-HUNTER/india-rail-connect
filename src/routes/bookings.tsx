import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, ArrowRight, Calendar, Train as TrainIcon } from "lucide-react";
import { formatDate, formatINR, formatTime, statusColor } from "@/lib/format";

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [{ title: "My Bookings — BharatRail" }, { name: "robots", content: "noindex" }] }),
  component: BookingsPage,
});

function BookingsPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate({ to: "/auth", search: { redirect: "/bookings" } });
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setBookings(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6"><div className="surface-card h-64 animate-pulse" /></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-deep">My Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">{bookings.length} journey{bookings.length !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild className="bg-saffron text-saffron-foreground hover:bg-saffron/90">
          <Link to="/">Book new ticket</Link>
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
          <div className="mt-3 font-display text-lg font-bold">No bookings yet</div>
          <p className="mt-1 text-sm text-muted-foreground">Your booked journeys will appear here.</p>
          <Button asChild className="mt-4 bg-saffron text-saffron-foreground hover:bg-saffron/90">
            <Link to="/">Search trains</Link>
          </Button>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {bookings.map((b) => (
            <Link
              key={b.id}
              to="/booking/$bookingId"
              params={{ bookingId: b.id }}
              className="block"
            >
              <Card className="p-4 transition-all hover:border-saffron hover:shadow-elevated">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-saffron text-saffron-foreground hover:bg-saffron">{b.train_number}</Badge>
                      <span className="font-display text-lg font-bold text-navy-deep">{b.train_name}</span>
                      <Badge variant="outline">{b.class_code}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                      <div>
                        <span className="font-display text-lg font-bold">{formatTime(b.departure_time)}</span>
                        <span className="ml-1 text-muted-foreground">· {b.from_code}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-display text-lg font-bold">{formatTime(b.arrival_time)}</span>
                        <span className="ml-1 text-muted-foreground">· {b.to_code}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(b.journey_date)}</span>
                      <span>PNR: <span className="font-mono font-semibold">{b.pnr}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-bold text-navy-deep">{formatINR(b.total_fare)}</div>
                    <span className={`mt-1 inline-flex rounded px-2 py-0.5 text-xs font-semibold ${statusColor(b.booking_status)}`}>
                      {b.booking_status}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
