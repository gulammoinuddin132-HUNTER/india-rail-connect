import { createFileRoute, Link } from "@tanstack/react-router";
import { SearchForm } from "@/components/SearchForm";
import { Shield, Zap, Ticket, Train, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-train.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BharatRail — Book Indian Railway Tickets Online" },
      {
        name: "description",
        content:
          "Search Rajdhani, Shatabdi, Vande Bharat, and Express trains. Book tickets across the Indian Railways network with secure checkout.",
      },
    ],
  }),
  component: Home,
});

const POPULAR_ROUTES = [
  { from: "NDLS", to: "MMCT", label: "New Delhi → Mumbai Central" },
  { from: "MAS", to: "SBC", label: "Chennai → Bengaluru" },
  { from: "HWH", to: "NDLS", label: "Howrah → New Delhi" },
  { from: "NDLS", to: "BSB", label: "New Delhi → Varanasi" },
  { from: "MMCT", to: "ADI", label: "Mumbai → Ahmedabad" },
  { from: "NZM", to: "TVC", label: "Delhi → Trivandrum" },
];

function Home() {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Indian Railways train speeding through a mountain landscape at sunset"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 hero-gradient opacity-90" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-32 lg:px-6 lg:pt-24">
          <div className="max-w-2xl text-navy-foreground">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="inline-block h-2 w-2 rounded-full bg-saffron" />
              Official-look booking portal for the Indian Railways network
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Travel across India.
              <span className="block text-saffron">One ticket at a time.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-navy-foreground/80">
              Search Rajdhani, Shatabdi, Vande Bharat, Duronto, and Express services.
              Book with confidence, check PNR status, and manage your journeys.
            </p>
          </div>
        </div>
      </section>

      {/* Search bar (overlapping hero) */}
      <section className="relative -mt-24 px-4 lg:px-6">
        <div className="mx-auto max-w-6xl">
          <SearchForm initialDate={tomorrow} />
        </div>
      </section>

      {/* Popular routes */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-saffron">Popular routes</div>
            <h2 className="mt-1 font-display text-2xl font-bold text-navy-deep md:text-3xl">
              Where India travels most
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {POPULAR_ROUTES.map((r) => (
            <Link
              key={r.label}
              to="/search"
              search={{ from: r.from, to: r.to, date: tomorrow, quota: "GN" }}
              className="group surface-card flex items-center justify-between p-4 transition-all hover:border-saffron hover:shadow-elevated"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Train className="h-3 w-3" /> {r.from} → {r.to}
                </div>
                <div className="mt-1 font-display font-semibold text-navy-deep">{r.label}</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-saffron" />
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/50 py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Real-time search",
                body: "Instantly compare trains, classes, and fares across the network.",
              },
              {
                icon: Shield,
                title: "Secure booking",
                body: "Every ticket is protected by encrypted checkout and account-only access.",
              },
              {
                icon: Ticket,
                title: "PNR & ticket history",
                body: "Look up any PNR, or view all your past bookings in one place.",
              },
            ].map((f) => (
              <div key={f.title} className="surface-card p-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-navy-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="font-display text-lg font-bold text-navy-deep">{f.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
