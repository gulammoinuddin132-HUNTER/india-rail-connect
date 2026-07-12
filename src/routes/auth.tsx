import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Train } from "lucide-react";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Sign in — BharatRail" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: redirect ?? "/bookings", replace: true });
    }
  }, [isAuthenticated, navigate, redirect]);

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 lg:grid-cols-2 lg:px-6">
      <div className="hidden lg:block">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-navy-foreground shadow-elevated">
          <Train className="h-7 w-7" />
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold text-navy-deep">Welcome aboard.</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Sign in to book train tickets, save passenger details for faster checkout,
          and view your booking history in one place.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <span className="inline-block h-3 w-5 rounded-sm bg-saffron" />
          <span className="inline-block h-3 w-5 rounded-sm bg-white ring-1 ring-border" />
          <span className="inline-block h-3 w-5 rounded-sm bg-india-green" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">For the Indian traveller</span>
        </div>
      </div>

      <Card className="p-6 shadow-elevated">
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin"><SignInForm redirect={redirect} /></TabsContent>
          <TabsContent value="signup"><SignUpForm redirect={redirect} /></TabsContent>
        </Tabs>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">← Back to home</Link>
        </p>
      </Card>
    </div>
  );
}

function SignInForm({ redirect }: { redirect?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in.");
    navigate({ to: redirect ?? "/bookings", replace: true });
  }
  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div>
        <Label htmlFor="si-email">Email</Label>
        <Input id="si-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} />
      </div>
      <div>
        <Label htmlFor="si-pw">Password</Label>
        <Input id="si-pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} maxLength={200} />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-saffron text-saffron-foreground hover:bg-saffron/90">
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

function SignUpForm({ redirect }: { redirect?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name, phone },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created.");
    navigate({ to: redirect ?? "/bookings", replace: true });
  }
  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div>
        <Label htmlFor="su-name">Full name</Label>
        <Input id="su-name" required value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
      </div>
      <div>
        <Label htmlFor="su-email">Email</Label>
        <Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} />
      </div>
      <div>
        <Label htmlFor="su-phone">Mobile</Label>
        <Input id="su-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={15} />
      </div>
      <div>
        <Label htmlFor="su-pw">Password</Label>
        <Input id="su-pw" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} maxLength={200} />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-saffron text-saffron-foreground hover:bg-saffron/90">
        {loading ? "Creating..." : "Create account"}
      </Button>
    </form>
  );
}
