import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="mt-16 bg-navy-deep text-navy-foreground">
      <div className="tricolor-bar" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 lg:px-6">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-10 w-10" width={40} height={40} loading="lazy" />
            <div>
              <div className="font-display text-lg font-bold">BharatRail</div>
              <div className="text-[10px] uppercase tracking-widest text-saffron">Booking Portal</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-navy-foreground/70">
            Book train tickets across the Indian Railways network — Rajdhani, Shatabdi,
            Vande Bharat, Duronto, and Express services.
          </p>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-saffron">Travel</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-saffron">Book Ticket</Link></li>
            <li><Link to="/pnr" className="hover:text-saffron">PNR Status</Link></li>
            <li><Link to="/bookings" className="hover:text-saffron">My Bookings</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-saffron">Classes</div>
          <ul className="space-y-2 text-sm text-navy-foreground/70">
            <li>First AC (1A)</li>
            <li>Second AC (2A)</li>
            <li>Third AC (3A)</li>
            <li>Sleeper (SL)</li>
            <li>Chair Car / Executive</li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-saffron">Support</div>
          <ul className="space-y-2 text-sm text-navy-foreground/70">
            <li>Customer Care: 139</li>
            <li>Security Helpline: 182</li>
            <li>Enquiry: 139</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-navy-foreground/60 md:flex-row lg:px-6">
          <div>© {new Date().getFullYear()} BharatRail — A demo Indian rail booking portal.</div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-3 rounded-sm bg-saffron" />
            <span className="inline-block h-2 w-3 rounded-sm bg-white" />
            <span className="inline-block h-2 w-3 rounded-sm bg-india-green" />
            <span className="ml-2">Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
