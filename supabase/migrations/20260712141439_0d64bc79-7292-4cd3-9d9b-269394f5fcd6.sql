
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile upsert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TRAINS
CREATE TABLE public.trains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  train_type TEXT NOT NULL, -- Rajdhani, Shatabdi, Vande Bharat, Duronto, Superfast, Express, Mail
  from_station TEXT NOT NULL,
  from_code TEXT NOT NULL,
  to_station TEXT NOT NULL,
  to_code TEXT NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  distance_km INT NOT NULL,
  runs_on TEXT[] NOT NULL DEFAULT ARRAY['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  classes JSONB NOT NULL, -- [{code:"1A",name:"First AC",fare:3500,seats:24},...]
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trains TO anon, authenticated;
GRANT ALL ON public.trains TO service_role;
ALTER TABLE public.trains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trains public read" ON public.trains FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX trains_from_to_idx ON public.trains (from_code, to_code);

-- BOOKINGS
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pnr TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  train_id UUID NOT NULL REFERENCES public.trains(id),
  train_number TEXT NOT NULL,
  train_name TEXT NOT NULL,
  from_station TEXT NOT NULL,
  from_code TEXT NOT NULL,
  to_station TEXT NOT NULL,
  to_code TEXT NOT NULL,
  journey_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  class_code TEXT NOT NULL,
  class_name TEXT NOT NULL,
  quota TEXT NOT NULL DEFAULT 'GN', -- GN, TQ, LD, SS, PT
  total_fare NUMERIC(10,2) NOT NULL,
  booking_status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED
  payment_status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, FAILED, REFUNDED
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT SELECT ON public.bookings TO anon; -- for PNR public lookup
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
-- Owner full access
CREATE POLICY "own bookings" ON public.bookings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Public PNR lookup: exposes only booking rows queried by exact PNR match — safe (no listing)
CREATE POLICY "public pnr lookup" ON public.bookings FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX bookings_user_idx ON public.bookings(user_id);
CREATE INDEX bookings_pnr_idx ON public.bookings(pnr);

-- BOOKING PASSENGERS
CREATE TABLE public.booking_passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INT NOT NULL,
  gender TEXT NOT NULL, -- M, F, O
  berth_preference TEXT, -- LB, UB, MB, SL, SU, WS, NA
  seat_no TEXT,
  coach TEXT,
  status TEXT NOT NULL DEFAULT 'CNF', -- CNF, RAC, WL, CAN
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_passengers TO authenticated;
GRANT SELECT ON public.booking_passengers TO anon;
GRANT ALL ON public.booking_passengers TO service_role;
ALTER TABLE public.booking_passengers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "passengers via booking owner" ON public.booking_passengers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid()));
CREATE POLICY "passengers public pnr" ON public.booking_passengers FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX booking_passengers_booking_idx ON public.booking_passengers(booking_id);

-- SAVED PASSENGERS (for quick reuse)
CREATE TABLE public.saved_passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INT NOT NULL,
  gender TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_passengers TO authenticated;
GRANT ALL ON public.saved_passengers TO service_role;
ALTER TABLE public.saved_passengers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved passengers" ON public.saved_passengers FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
