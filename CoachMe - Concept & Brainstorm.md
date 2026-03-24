# CoachMe — Concept & Product Brainstorm

*A local sports coaching marketplace for casual athletes and hobbyists*

---

## 1. What You Have Today

Your MVP is solid. Here's what's already working:

**Authentication & Roles** — Email/password signup with two roles (coach and client). Role-based middleware protects dashboards. Supabase handles sessions and RLS secures all data at the database level.

**Coach Profiles** — Coaches can set their sport, specialty, description, hourly rate, years of experience, location, and contact info. Avatar uploads work. Profiles are publicly browsable.

**Search & Discovery** — Clients can search coaches by sport, location, or name. Results display in a card grid with key info at a glance.

**Availability & Booking** — Coaches define recurring weekly time slots. Clients pick a date, see what's open, and book 1-hour sessions. A Postgres function prevents double-bookings (race-condition safe). Coaches can confirm or cancel.

**Dashboards** — Both coaches and clients see their upcoming sessions. Coaches can manage availability and bookings. Clients can edit their profile and skill level.

**Tech Stack** — Next.js 16 (App Router), Supabase (Postgres + Auth + Storage), Tailwind CSS, TypeScript. Clean architecture with server components for data fetching, client components for interactivity, and server actions for mutations.

---

## 2. What's Missing (Gaps in the Current Build)

These are things you'd expect in a V1 launch that aren't there yet:

- **No monetization** — No subscription billing for coaches yet. No way for the platform to earn revenue. Payment between coach and client will happen directly (cash or card), but the coach listing fee isn't implemented.
- **No reviews or ratings** — Clients can't leave feedback, and there's no trust signal for new users.
- **No messaging** — Coach and client can't communicate before or after a booking. Contact info is shown publicly, but there's no in-app channel.
- **No email notifications** — No confirmation emails, reminders, or status updates when bookings change.
- **No cancellation policy** — Bookings can be cancelled freely with no rules around timing or consequences.
- **No session history** — Past sessions disappear. No record of what was worked on, no progress over time.
- **No onboarding flow** — After signup, users land on a bare dashboard. No guided setup, no "complete your profile" prompts.
- **No coach verification** — No way for coaches to verify their identity. No ID submission flow, no verified badge, no trust signal to distinguish legitimate coaches from potential scam accounts.

---

## 3. The Concept, Sharpened

### The Elevator Pitch

**CoachMe is the easiest way to find and book a local sports coach in your city.** Whether you're picking up tennis for the first time, want your kid to learn swimming, or need a running buddy who knows what they're doing — search by sport and neighborhood, read reviews, and book a session in under a minute.

### Who It's For

**Clients:** Casual athletes, complete beginners, parents booking for kids, weekend warriors trying a new sport. These people don't want a training program — they want a friendly, knowledgeable person to show them the ropes, once or on a regular basis.

**Coaches:** Independent instructors, retired athletes, PE teachers moonlighting, club coaches looking for extra income. People who are already coaching informally and want a simple way to get discovered and manage bookings.

### Why This Works for a Single City

Starting local is a strength, not a limitation. Here's why:

- **Trust is local.** People want a coach who knows the parks, courts, and pools in their area. "Tennis coach near Āgenskalns" is a more compelling search than a generic directory.
- **Supply-side is solvable.** You can personally recruit 20–30 coaches in your city and have a usable marketplace. You can't do that nationally.
- **Word of mouth compounds.** When someone has a great session, they tell their friends. That only works if their friends can also book locally.
- **You can iterate fast.** Talk to your coaches and clients directly. Fix what's broken. Nail the experience before scaling.

### What Makes CoachMe Different

Most coaching platforms target elite athletes, corporate wellness, or online-only sessions. CoachMe is for the other 95% — people who just want to get better at something physical, in person, near home. The vibe is approachable, not performative.

---

## 4. Feature Brainstorm — Grouped by Theme

### A. Trust & Social Proof

**Reviews & Ratings**
After a completed session, clients can rate the coach (1–5 stars) and leave a short review. Show average rating on coach cards. Let coaches respond to reviews. This is the single most important missing feature — without it, new clients have no reason to trust a stranger.

**Coach Verification & Verified Badge (Core Feature)**
Coaches can create an account and go live immediately — their profile is visible in search and they can receive bookings right away. No gates, no waiting. But there's a separate, optional verification step: at any point, a coach can submit a government-issued ID (passport or national ID card) through their dashboard. You (the admin) receive the submission, review it, and approve or reject. Approved coaches get a "Verified" badge displayed prominently on their profile and coach cards. This creates a two-tier trust system: unverified coaches can still use the platform, but verified coaches stand out and clients naturally gravitate toward them. The badge becomes a strong incentive for coaches to verify without forcing them through a gate that slows down onboarding.

**Session Count Display**
Show "150+ sessions coached" on profiles. Social proof through volume. Easy to implement since you already track bookings.

**"Recommended by" Tags**
If a client refers a friend, show "Recommended by [Name]" on the coach's profile for that friend. Personal endorsement > anonymous review.

---

### B. User Experience & Engagement

**Onboarding Flow**
After signup, walk users through a 3-step wizard: pick your sports interests → set your location/neighborhood → see recommended coaches. For coaches: add your sport → set your rate → add your first availability slots. Don't let them hit an empty dashboard.

**Session Notes & Progress**
After each session, the coach can leave a short note: "Worked on backhand today. Try to keep your elbow in." Clients see a timeline of their sessions with notes. Over time, this becomes a training log that's extremely sticky — clients won't want to leave because their history is here.

**Favorite Coaches**
Let clients save coaches to a favorites list. Simple, but it creates a personal shortlist and signals demand to coaches.

**Recurring Bookings**
"Book every Tuesday at 10am with Coach Maria." Instead of rebooking each week, let clients set up a recurring session. This is huge for retention — it turns one-time users into regulars.

**Smart Reminders**
Send a reminder 24 hours before a session, and a "How was it?" prompt after. Push the review flow post-session. Remind inactive users: "You haven't booked in 3 weeks — your coach has openings this Saturday."

**Goal Setting**
Clients can set simple goals: "Run 5K without stopping," "Learn to serve in tennis," "Swim 25m freestyle." Coaches can mark goals as in-progress or achieved. Lightweight gamification that gives sessions a sense of purpose.

---

### C. Expanding What Coaches Can Offer

**Multi-Sport Coaches**
Some coaches teach multiple sports (a fitness instructor might do running, swimming, and yoga). Let coach profiles list multiple sports instead of just one. Filter accordingly.

**Group Sessions**
A coach offers "Saturday morning beginner tennis — 4 spots available" at a lower per-person rate. Clients join a group. This is great for casual users who want a social, lower-commitment option. It also lets coaches earn more per hour.

**Trial Sessions**
Let coaches offer a discounted or free first session. Lowers the barrier for new clients. Show "Free trial available" as a badge on coach cards.

**Packages & Bundles**
"5 sessions for the price of 4" or "Beginner swimming: 8-session course." Coaches can create fixed packages with a set number of sessions, a description, and a price. Clients buy the package and schedule sessions from it.

**Location Pins**
Coaches tag where they hold sessions — a specific park, a gym, a pool. Show these on a map. Clients can search by proximity: "Show me coaches within 2km." For a city-first platform, this is a killer feature.

**Photo Gallery**
Let coaches upload photos of their coaching environment — the court they use, the gym, their group in action. Visual proof builds trust and gives clients a feel for the experience.

---

### D. Monetization & Business Model

**Core Model: Coach Subscription + Flexible Client Payments**
The platform makes money by charging coaches a monthly listing fee to be visible on the marketplace. This is simpler than commission-based models, predictable as revenue, and aligned with how coaches actually work — most prefer to handle payments themselves, especially cash.

Clients choose how to pay the coach at the time of the session: cash or card. The platform doesn't sit in the middle of that transaction. This keeps things lightweight and avoids the complexity of escrow, refunds, and payout delays.

**Why This Works**
Coaches already pay for advertising, gym rental, and equipment. A monthly fee to be listed on a platform that brings them clients is an easy sell — especially if it's cheaper than a Facebook ad. It also means you earn revenue from day one, before you even have booking volume. And because payment happens directly between coach and client, there's zero payment infrastructure to build initially.

**Coach Subscription: €30/month**
One simple plan, one price. €30/month gets coaches everything: profile listing, search visibility, availability management, bookings, dashboard, analytics, and the ability to offer group sessions and packages. No confusing tiers — every coach gets the full experience.

A free first month gets coaches onboarded without friction. Convert them once they see bookings coming in.

**Optional: Card Payments via Stripe**
For clients who prefer to pay by card, integrate Stripe as an optional checkout step. The coach marks whether they accept card payments. If yes, the client can pay online at booking time. The platform passes the payment through to the coach (minus Stripe's processing fee — which the coach absorbs or passes on). This is a nice-to-have, not a launch requirement. Cash-first is fine for V1.

**Payment Method Display**
On each coach's profile and at booking time, clearly show accepted payment methods: "Cash," "Card," or "Cash & Card." Set expectations upfront so there's no confusion at the session.

**Session Confirmation Flow**
Since payment often happens in person (cash), the booking flow should include a post-session confirmation step. After the session time passes, both coach and client can mark the session as "completed." This closes the loop and triggers the review prompt. If neither confirms within 48 hours, auto-mark as completed.

**Future Revenue Expansion**
Once the platform has traction, additional revenue streams can layer on top of the subscription model:

- *Featured listings*: Coaches pay a per-boost fee to appear at the top of search results or on the homepage for a week. Subtle — a "Featured" badge, not an ad.
- *Client subscription ("CoachMe Plus")*: A monthly subscription giving clients perks like priority booking, session notes archive, and discounts. This is a later-stage play.
- *Corporate / B2B*: Companies buy coaching credits for employees as a wellness benefit. "Give your team 4 coaching sessions per quarter." Worth designing for eventually.

---

### E. Discovery & Growth

**Neighborhood-Based Browsing**
Instead of just city-wide search, let users browse by neighborhood. "Coaches in Āgenskalns," "Coaches in Teika." This feels hyper-local and relevant. You can curate "Top coaches in [Neighborhood]" pages for SEO.

**Sport Landing Pages**
Dedicated pages: "Tennis Coaches in Riga," "Swimming Coaches in Riga." Each with a description, top coaches, and FAQ. Great for organic search traffic.

**Referral Program**
"Invite a friend, and they get their first session booking fee-free." Referrals are the highest-converting channel for local services. Track referrals with a simple code system.

**Coach Referral Incentive**
Coaches who invite other coaches get a free month of their subscription. Solving the supply side is your biggest challenge — incentivize coaches to recruit their peers.

**Social Sharing**
After a session, prompt clients to share: "I just had a great tennis lesson with Coach Maria on CoachMe!" with a link to the coach's profile. Simple, but it works.

**Seasonal Campaigns**
"New Year, New Sport" (January), "Summer Sports Week" (June), "Back to School Coaching" (September). Themed promotions tied to when people naturally think about trying something new.

---

### F. Platform Quality & Safety

**Coach Application & Vetting**
The verification pipeline needs: a "Get Verified" section in the coach dashboard where they can upload their ID and optionally attach coaching certifications, first-aid qualifications, or links to a club/organization. An admin dashboard where you see pending verification requests with all submitted documents, approve/reject buttons with an optional rejection reason (emailed to the coach), and a status indicator on the coach's dashboard ("Not Verified," "Pending Review," "Verified," or "Rejected — reason"). ID documents should be stored securely in a private Supabase storage bucket (not publicly accessible) and deleted after review to minimize liability.

**Cancellation Policies**
Let coaches set their own cancellation window (e.g., free cancellation up to 24h before). Since payment happens directly between coach and client (mostly cash), the platform can't enforce financial penalties — but it can track no-shows and late cancellations, display a reliability score, and warn repeat offenders.

**Incident Reporting**
A simple "Report an issue" button on bookings. If something goes wrong, clients can flag it. You review and take action. Basic trust & safety.

**Insurance Guidance**
Provide information to coaches about liability insurance for sports instruction. You're not the insurer, but helping coaches get covered protects everyone.

---

## 5. Suggested Roadmap — What to Build Next

### Phase 1: Launch-Ready (Next 2–4 Weeks)
*Make the MVP trustworthy and usable enough to put in front of real people.*

1. **Coach verification flow** — "Get Verified" section in coach dashboard, ID/passport upload, optional certifications, submission triggers admin review
2. **Admin review dashboard** — View pending verification requests, see uploaded ID and profile info, approve/reject with reason
3. **Email notifications** — Booking confirmation, status changes, reminders, verification status updates
4. **Onboarding wizard** — Guided setup for both roles (coaches prompted to verify but not blocked, clients guided through sport interests)
5. **Reviews & ratings** — Post-session feedback with star ratings
6. **Basic cancellation rules** — At minimum, a 24h free cancellation window

### Phase 2: Subscriptions & Retention (Weeks 4–8)
*Turn listings into revenue and give users reasons to come back.*

6. **Coach subscription billing** — Stripe subscription for €30/month listing fee, with a free first month
7. **Payment method display** — Coaches mark cash/card preference, shown on profile and at booking
8. **Post-session confirmation** — Both parties confirm session happened, triggers review prompt
9. **Session notes** — Coach leaves notes after each session
10. **Recurring bookings** — Weekly auto-rebooking
11. **Favorites list & multi-sport support**

### Phase 3: Growth & Discovery (Weeks 8–12)
*Get more users and make the platform feel alive.*

11. **Location map** — Coaches pin their session locations, clients search by proximity
12. **Group sessions** — Coaches offer multi-person bookings
13. **Referral program** — Invite friends, earn discounts
14. **Sport & neighborhood landing pages** — SEO-optimized discovery pages
15. **Packages & bundles** — Multi-session deals

### Phase 4: Engagement & Scale (Months 3–6)
*Deepen the product and prepare for growth beyond one city.*

16. **In-app messaging** — Coach-client chat
17. **Goal tracking** — Clients set goals, coaches mark progress
18. **Coach analytics dashboard** — Profile views, booking conversion, earnings
19. **Coach tiers (free/pro)** — Monetize the supply side
20. **Second city expansion** — Replicate the playbook

---

## 6. Key Metrics to Track

Once you launch, these numbers will tell you if it's working:

- **Booking completion rate** — What % of bookings actually happen (vs. cancelled/no-show)?
- **Repeat booking rate** — What % of clients book a second session? This is your north star.
- **Coach utilization** — What % of available slots get booked? Low utilization means you have too many coaches or not enough demand.
- **Time to first booking** — How long after signup does a client make their first booking? Shorter is better.
- **Review submission rate** — What % of completed sessions get a review? Aim for 30%+.
- **Coach activation rate** — What % of coaches who sign up actually set availability and get their first booking?

---

## 7. Competitive Positioning

| | CoachMe | Generic fitness apps | Personal trainer platforms | Local classifieds |
|---|---|---|---|---|
| **Focus** | Any sport, local, casual | Fitness/gym only | Premium, serious athletes | No structure |
| **Booking** | Integrated, real-time | Varies | Yes | None |
| **Discovery** | By sport + neighborhood | By category | By specialty | By listing |
| **Trust** | Reviews, verified badges | App store ratings | Credentials | None |
| **Price point** | €30/mo for coaches, free for clients | Subscription-based | Premium ($80+/hr) | Varies |
| **Vibe** | Friendly, approachable | Corporate wellness | Performance-driven | DIY |

Your sweet spot: **structured enough to feel trustworthy, casual enough to feel approachable, local enough to feel relevant.**

---

*Generated March 24, 2026*
