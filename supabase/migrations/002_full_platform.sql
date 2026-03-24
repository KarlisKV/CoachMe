-- ============================================================
-- Migration 002: Full Platform Features
-- Coach verification, reviews, messaging, subscriptions,
-- group sessions, packages, goals, referrals, favorites
-- ============================================================

-- ============================================================
-- 1. MODIFY EXISTING TABLES
-- ============================================================

-- profiles: add onboarding, referral
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id);

-- coach_profiles: add multi-sport, payment, verification, subscription, location coords
ALTER TABLE public.coach_profiles
  ADD COLUMN IF NOT EXISTS sports text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS payment_methods text DEFAULT 'cash' CHECK (payment_methods IN ('cash', 'card', 'both')),
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'trial', 'active', 'cancelled')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS session_location_name text,
  ADD COLUMN IF NOT EXISTS cancellation_hours integer DEFAULT 24;

-- bookings: add completion tracking, cancellation, recurring, session notes
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS completed_by_coach boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_by_client boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurring_booking_id uuid,
  ADD COLUMN IF NOT EXISTS payment_method text CHECK (payment_method IN ('cash', 'card'));

-- Update bookings status to include 'completed'
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));

-- ============================================================
-- 2. NEW TABLES
-- ============================================================

-- verification_requests
CREATE TABLE public.verification_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE NOT NULL,
  id_document_url text NOT NULL,
  certification_urls text[] DEFAULT '{}',
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- reviews
CREATE TABLE public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  client_id uuid REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  coach_response text,
  created_at timestamptz DEFAULT now()
);

-- session_notes
CREATE TABLE public.session_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE NOT NULL,
  note text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- favorites
CREATE TABLE public.favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, coach_id)
);

-- messages
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- goals
CREATE TABLE public.goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'achieved')),
  created_at timestamptz DEFAULT now(),
  achieved_at timestamptz
);

-- group_sessions
CREATE TABLE public.group_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  sport text NOT NULL,
  max_participants integer NOT NULL DEFAULT 6,
  price_per_person numeric(10,2) NOT NULL,
  location text,
  latitude double precision,
  longitude double precision,
  session_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- group_session_participants
CREATE TABLE public.group_session_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_session_id uuid REFERENCES public.group_sessions(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
  payment_method text CHECK (payment_method IN ('cash', 'card')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_session_id, client_id)
);

-- packages
CREATE TABLE public.packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  sport text NOT NULL,
  session_count integer NOT NULL,
  price numeric(10,2) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- package_purchases
CREATE TABLE public.package_purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id uuid REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sessions_remaining integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- referrals
CREATE TABLE public.referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referee_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referral_code text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(referrer_id, referee_id)
);

-- coach_analytics (daily aggregates)
CREATE TABLE public.coach_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  profile_views integer DEFAULT 0,
  bookings_received integer DEFAULT 0,
  bookings_completed integer DEFAULT 0,
  revenue numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(coach_id, date)
);

-- email_notifications (log)
CREATE TABLE public.email_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  subject text NOT NULL,
  sent_at timestamptz DEFAULT now()
);

-- admin_users (simple admin role tracking)
CREATE TABLE public.admin_users (
  id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX idx_verification_requests_coach ON public.verification_requests(coach_id);
CREATE INDEX idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX idx_reviews_coach ON public.reviews(coach_id);
CREATE INDEX idx_reviews_client ON public.reviews(client_id);
CREATE INDEX idx_session_notes_booking ON public.session_notes(booking_id);
CREATE INDEX idx_favorites_client ON public.favorites(client_id);
CREATE INDEX idx_favorites_coach ON public.favorites(coach_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_booking ON public.messages(booking_id);
CREATE INDEX idx_goals_client ON public.goals(client_id);
CREATE INDEX idx_goals_coach ON public.goals(coach_id);
CREATE INDEX idx_group_sessions_coach ON public.group_sessions(coach_id);
CREATE INDEX idx_group_sessions_date ON public.group_sessions(session_date);
CREATE INDEX idx_group_participants_session ON public.group_session_participants(group_session_id);
CREATE INDEX idx_packages_coach ON public.packages(coach_id);
CREATE INDEX idx_package_purchases_client ON public.package_purchases(client_id);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_coach_analytics_coach_date ON public.coach_analytics(coach_id, date);
CREATE INDEX idx_coach_profiles_verification ON public.coach_profiles(verification_status);
CREATE INDEX idx_coach_profiles_coords ON public.coach_profiles(latitude, longitude);
CREATE INDEX idx_bookings_recurring ON public.bookings(recurring_booking_id);

-- ============================================================
-- 4. RLS POLICIES
-- ============================================================

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- verification_requests policies
CREATE POLICY "Coaches can view own verification requests" ON public.verification_requests
  FOR SELECT USING (auth.uid() = coach_id OR EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
CREATE POLICY "Coaches can insert own verification requests" ON public.verification_requests
  FOR INSERT WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Admins can update verification requests" ON public.verification_requests
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Clients can insert own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Coaches can update own reviews (response only)" ON public.reviews
  FOR UPDATE USING (auth.uid() = coach_id);

-- session_notes policies
CREATE POLICY "Session notes viewable by involved parties" ON public.session_notes
  FOR SELECT USING (
    auth.uid() = coach_id OR
    EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND client_id = auth.uid())
  );
CREATE POLICY "Coaches can insert session notes" ON public.session_notes
  FOR INSERT WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Coaches can update own session notes" ON public.session_notes
  FOR UPDATE USING (auth.uid() = coach_id);

-- favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can insert own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = client_id);

-- messages policies
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receivers can update messages (read status)" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- goals policies
CREATE POLICY "Goals viewable by involved parties" ON public.goals
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = coach_id);
CREATE POLICY "Clients can insert goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Involved parties can update goals" ON public.goals
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = coach_id);
CREATE POLICY "Clients can delete own goals" ON public.goals
  FOR DELETE USING (auth.uid() = client_id);

-- group_sessions policies
CREATE POLICY "Group sessions are viewable by everyone" ON public.group_sessions FOR SELECT USING (true);
CREATE POLICY "Coaches can insert own group sessions" ON public.group_sessions
  FOR INSERT WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Coaches can update own group sessions" ON public.group_sessions
  FOR UPDATE USING (auth.uid() = coach_id);
CREATE POLICY "Coaches can delete own group sessions" ON public.group_sessions
  FOR DELETE USING (auth.uid() = coach_id);

-- group_session_participants policies
CREATE POLICY "Participants viewable by coach and participant" ON public.group_session_participants
  FOR SELECT USING (
    auth.uid() = client_id OR
    EXISTS (SELECT 1 FROM public.group_sessions WHERE id = group_session_id AND coach_id = auth.uid())
  );
CREATE POLICY "Clients can join group sessions" ON public.group_session_participants
  FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Participants can update own registration" ON public.group_session_participants
  FOR UPDATE USING (auth.uid() = client_id);

-- packages policies
CREATE POLICY "Packages are viewable by everyone" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Coaches can insert own packages" ON public.packages
  FOR INSERT WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Coaches can update own packages" ON public.packages
  FOR UPDATE USING (auth.uid() = coach_id);
CREATE POLICY "Coaches can delete own packages" ON public.packages
  FOR DELETE USING (auth.uid() = coach_id);

-- package_purchases policies
CREATE POLICY "Purchases viewable by client and coach" ON public.package_purchases
  FOR SELECT USING (
    auth.uid() = client_id OR
    EXISTS (SELECT 1 FROM public.packages WHERE id = package_id AND coach_id = auth.uid())
  );
CREATE POLICY "Clients can purchase packages" ON public.package_purchases
  FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Involved parties can update purchases" ON public.package_purchases
  FOR UPDATE USING (
    auth.uid() = client_id OR
    EXISTS (SELECT 1 FROM public.packages WHERE id = package_id AND coach_id = auth.uid())
  );

-- referrals policies
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);
CREATE POLICY "Users can insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- coach_analytics policies
CREATE POLICY "Coaches can view own analytics" ON public.coach_analytics
  FOR SELECT USING (auth.uid() = coach_id);
CREATE POLICY "System can insert analytics" ON public.coach_analytics
  FOR INSERT WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "System can update analytics" ON public.coach_analytics
  FOR UPDATE USING (auth.uid() = coach_id);

-- email_notifications policies
CREATE POLICY "Users can view own notifications" ON public.email_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- admin_users policies
CREATE POLICY "Admins can view admin list" ON public.admin_users
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- ============================================================
-- 5. FUNCTIONS
-- ============================================================

-- Auto-complete bookings after 48 hours
CREATE OR REPLACE FUNCTION public.auto_complete_bookings()
RETURNS void AS $$
BEGIN
  UPDATE public.bookings
  SET status = 'completed', completed_at = now()
  WHERE status = 'confirmed'
    AND (slot_date + end_time::interval) < (now() - interval '48 hours')
    AND completed_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := upper(substr(md5(random()::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- Update group session status when full
CREATE OR REPLACE FUNCTION public.check_group_session_capacity()
RETURNS trigger AS $$
DECLARE
  v_count integer;
  v_max integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.group_session_participants
  WHERE group_session_id = NEW.group_session_id AND status = 'registered';

  SELECT max_participants INTO v_max
  FROM public.group_sessions
  WHERE id = NEW.group_session_id;

  IF v_count >= v_max THEN
    UPDATE public.group_sessions SET status = 'full' WHERE id = NEW.group_session_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_capacity_after_join
  AFTER INSERT ON public.group_session_participants
  FOR EACH ROW EXECUTE FUNCTION public.check_group_session_capacity();

-- Average rating view for coaches
CREATE OR REPLACE VIEW public.coach_ratings AS
SELECT
  coach_id,
  COUNT(*) as review_count,
  ROUND(AVG(rating)::numeric, 1) as avg_rating
FROM public.reviews
GROUP BY coach_id;
