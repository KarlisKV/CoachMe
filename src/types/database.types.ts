export type UserRole = 'client' | 'coach';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type PaymentMethod = 'cash' | 'card' | 'both';
export type SubscriptionStatus = 'inactive' | 'trial' | 'active' | 'cancelled';
export type GoalStatus = 'in_progress' | 'achieved';
export type GroupSessionStatus = 'open' | 'full' | 'cancelled' | 'completed';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  onboarding_completed: boolean;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
}

export interface CoachProfile {
  id: string;
  sport: string;
  sports: string[];
  specialty: string | null;
  description: string | null;
  hourly_rate: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  experience_years: number | null;
  payment_methods: PaymentMethod;
  verification_status: VerificationStatus;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_ends_at: string | null;
  latitude: number | null;
  longitude: number | null;
  session_location_name: string | null;
  cancellation_hours: number;
}

export interface ClientProfile {
  id: string;
  skill_level: SkillLevel | null;
  sports_interests: string[];
}

export interface AvailabilitySlot {
  id: string;
  coach_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  client_id: string;
  coach_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  completed_by_coach: boolean;
  completed_by_client: boolean;
  completed_at: string | null;
  cancelled_at: string | null;
  is_recurring: boolean;
  recurring_booking_id: string | null;
  payment_method: 'cash' | 'card' | null;
  created_at: string;
}

export interface VerificationRequest {
  id: string;
  coach_id: string;
  id_document_url: string;
  certification_urls: string[];
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  client_id: string;
  coach_id: string;
  rating: number;
  comment: string | null;
  coach_response: string | null;
  created_at: string;
}

export interface SessionNote {
  id: string;
  booking_id: string;
  coach_id: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  client_id: string;
  coach_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  booking_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Goal {
  id: string;
  client_id: string;
  coach_id: string | null;
  title: string;
  description: string | null;
  status: GoalStatus;
  created_at: string;
  achieved_at: string | null;
}

export interface GroupSession {
  id: string;
  coach_id: string;
  title: string;
  description: string | null;
  sport: string;
  max_participants: number;
  price_per_person: number;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  session_date: string;
  start_time: string;
  end_time: string;
  status: GroupSessionStatus;
  created_at: string;
}

export interface GroupSessionParticipant {
  id: string;
  group_session_id: string;
  client_id: string;
  status: 'registered' | 'cancelled';
  payment_method: 'cash' | 'card' | null;
  created_at: string;
}

export interface Package {
  id: string;
  coach_id: string;
  title: string;
  description: string | null;
  sport: string;
  session_count: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface PackagePurchase {
  id: string;
  package_id: string;
  client_id: string;
  sessions_remaining: number;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  referral_code: string;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface CoachAnalytics {
  id: string;
  coach_id: string;
  date: string;
  profile_views: number;
  bookings_received: number;
  bookings_completed: number;
  revenue: number;
  created_at: string;
}

export interface CoachRating {
  coach_id: string;
  review_count: number;
  avg_rating: number;
}

// Compound types
export interface CoachWithProfile extends CoachProfile {
  profiles: Profile;
}

export interface CoachWithProfileAndRating extends CoachWithProfile {
  coach_ratings?: CoachRating[];
}

export interface BookingWithCoach extends Booking {
  coach_profiles: CoachProfile & { profiles: Profile };
  session_notes?: SessionNote[];
  reviews?: Review[];
}

export interface BookingWithClient extends Booking {
  client_profiles: ClientProfile & { profiles: Profile };
  session_notes?: SessionNote[];
  reviews?: Review[];
}

export interface VerificationRequestWithCoach extends VerificationRequest {
  coach_profiles: CoachProfile & { profiles: Profile };
}

export interface MessageWithProfiles extends Message {
  sender: Profile;
  receiver: Profile;
}

export interface GroupSessionWithCoach extends GroupSession {
  coach_profiles: CoachProfile & { profiles: Profile };
  participant_count?: number;
}

export interface PackageWithCoach extends Package {
  coach_profiles: CoachProfile & { profiles: Profile };
}
