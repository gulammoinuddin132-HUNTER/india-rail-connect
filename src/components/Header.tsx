import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Train, Search, Ticket, LogOut, User as UserIcon, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import logo from "@/assets/logo.png";

export function Header() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const NavLink = ({ to, label, icon: Icon }: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const active = path === to || (to !== "/" && path.startsWith(to));
    return (
      <Link
        to={to}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          active
            ? "bg-saffron/15 text-saffron"
            : "text-navy-foreground/80 hover:bg-white/10 hover:text-navy-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-navy-deep text-navy-foreground shadow-elevated">
      <div className="tricolor-bar" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="BharatRail" className="h-10 w-10" width={40} height={40} />
          <div className="leading-tight">
            <div className="font-display text-lg font-bold tracking-tight">BharatRail</div>
            <div className="text-[10px] uppercase tracking-widest text-saffron">Indian Railways Booking</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" label="Book Ticket" icon={Search} />
          <NavLink to="/pnr" label="PNR Status" icon={Ticket} />
          <NavLink to="/bookings" label="My Bookings" icon={Train} />
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-navy-foreground hover:bg-white/10 hover:text-navy-foreground">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-[140px] truncate">{user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/bookings">My Bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => navigate({ to: "/auth" })}
              className="bg-saffron text-saffron-foreground hover:bg-saffron/90"
            >
              Sign in
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-navy-foreground hover:bg-white/10"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-navy-deep px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/" label="Book Ticket" icon={Search} />
            <NavLink to="/pnr" label="PNR Status" icon={Ticket} />
            <NavLink to="/bookings" label="My Bookings" icon={Train} />
          </div>
        </div>
      )}
    </header>
  );
}
