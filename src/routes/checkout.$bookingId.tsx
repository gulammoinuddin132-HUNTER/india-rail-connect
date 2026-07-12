import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { CreditCard, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { formatINR, formatTime, formatDate } from "@/lib/format";

export const Route = createFileRoute("/checkout/$bookingId")({
  head: () => ({ meta: [{ title: "Payment — BharatRail" }, { name: "robots", content: "noindex" }] }),
  component: Checkout,
});

function Checkout() {
  const { bookingId } = Route.useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/auth", search: { redirect: `/checkout/${bookingId}` } });
    }
  }, [authLoading, isAuthenticated, bookingId, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      const { data } = await supabase.from("bookings").select("*").eq("id", bookingId).maybeSingle();
      setBooking(data);
      setLoading(false);
    })();
  }, [bookingId, isAuthenticated]);

  async function handlePay() {
    if (!booking) return;
    if (method === "upi" && !/^[\w.-]+@[\w.-]+$/.test(upiId)) {
      toast.error("Enter a valid UPI ID (e.g., name@bank).");
      return;
    }
    setProcessing(true);
    // Simulate payment gateway
    await new Promise((r) => setTimeout(r, 1800));
    const { error } = await supabase
      .from("bookings")
      .update({
        payment_status: "PAID",
        booking_status: "CONFIRMED",
        payment_method: method.toUpperCase(),
        paid_at: new Date().toISOString(),
      } as any)
      .eq("id", bookingId);

    setProcessing(false);
    if (error) {
      toast.error("Payment failed.");
      return;
    }
    toast.success("Payment successful!");
    navigate({ to: "/booking/$bookingId", params: { bookingId } });
  }

  if (loading || !booking) {
    return <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6"><div className="surface-card h-64 animate-pulse" /></div>;
  }

  if (booking.payment_status === "PAID") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 lg:px-6">
        <Card className="p-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-india-green" />
          <div className="mt-3 font-display text-2xl font-bold">Payment already completed</div>
          <p className="mt-1 text-sm text-muted-foreground">PNR {booking.pnr} is confirmed.</p>
          <Button asChild className="mt-5"><Link to="/booking/$bookingId" params={{ bookingId }}>View ticket</Link></Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-2xl font-bold text-navy-deep">Complete payment</h1>
      <p className="mt-1 text-sm text-muted-foreground">Secure sandbox payment · No real money will be charged.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
            <CreditCard className="h-5 w-5 text-saffron" /> Choose payment method
          </div>
          <RadioGroup value={method} onValueChange={setMethod} className="space-y-2">
            {[
              { v: "upi", label: "UPI", desc: "Google Pay / PhonePe / Paytm / BHIM" },
              { v: "card", label: "Credit/Debit Card", desc: "Visa · Mastercard · RuPay" },
              { v: "netbanking", label: "Net Banking", desc: "All major Indian banks" },
              { v: "wallet", label: "Wallet", desc: "Paytm / Mobikwik / Amazon Pay" },
            ].map((o) => (
              <label key={o.v} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${method === o.v ? "border-saffron bg-saffron/5" : "border-border"}`}>
                <RadioGroupItem value={o.v} id={`m-${o.v}`} />
                <div>
                  <div className="font-medium">{o.label}</div>
                  <div className="text-xs text-muted-foreground">{o.desc}</div>
                </div>
              </label>
            ))}
          </RadioGroup>

          {method === "upi" && (
            <div className="mt-4">
              <Label htmlFor="upi">UPI ID</Label>
              <Input id="upi" placeholder="name@bank" value={upiId} onChange={(e) => setUpiId(e.target.value)} maxLength={80} />
            </div>
          )}
          {method === "card" && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Card number</Label>
                <Input placeholder="4242 4242 4242 4242" maxLength={19} />
              </div>
              <div>
                <Label>Expiry</Label>
                <Input placeholder="MM/YY" maxLength={5} />
              </div>
              <div>
                <Label>CVV</Label>
                <Input placeholder="•••" maxLength={4} type="password" />
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center gap-2 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-india-green" />
            256-bit encrypted · PCI DSS compliant sandbox
          </div>
        </Card>

        <Card className="p-5">
          <div className="font-display text-lg font-bold">Order summary</div>
          <div className="mt-3 text-sm">
            <div className="font-semibold">{booking.train_name}</div>
            <div className="text-xs text-muted-foreground">
              {booking.train_number} · {booking.class_code} · {booking.quota}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="font-display text-lg font-bold">{formatTime(booking.departure_time)}</div>
                <div className="text-xs text-muted-foreground">{booking.from_code}</div>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="text-right">
                <div className="font-display text-lg font-bold">{formatTime(booking.arrival_time)}</div>
                <div className="text-xs text-muted-foreground">{booking.to_code}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{formatDate(booking.journey_date)}</div>

            <div className="my-4 border-t" />
            <div className="flex items-center justify-between">
              <span className="font-display text-base font-semibold">Amount</span>
              <span className="font-display text-2xl font-bold text-navy-deep">{formatINR(booking.total_fare)}</span>
            </div>
          </div>
          <Button
            onClick={handlePay}
            disabled={processing}
            className="mt-5 w-full bg-india-green text-india-green-foreground hover:bg-india-green/90"
          >
            {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Pay ${formatINR(booking.total_fare)}`}
          </Button>
        </Card>
      </div>
    </div>
  );
}
