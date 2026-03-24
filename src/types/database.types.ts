export type UserRole = 'client' | 'coach';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface CoachProfile {
  id: string;
  sport: string;
  specialty: string | null;
  description: string | null;
  hourly_rate: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  experience_years: number | null;
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
  created_at: string;
}

export interface CoachWithProfile extends CoachProfile {
  profiles: Profile;
}

export interface BookingWithCoach extends Booking {
  coach_profiles: CoachProfile & { profiles: Profile };
}

export interface BookingWithClient extends Booking {
  client_profiles: ClientProfile & { profiles: Profile };
}
