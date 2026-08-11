# CompanyBoard Product Roadmap

## Vision
CompanyBoard is building the trusted operating system for private company reputation, performance visibility, and partner discovery.

Today, founders and operators manage critical relationships across fragmented tools, warm intros, private spreadsheets, Slack groups, agencies, CRMs, and disconnected communities. The result is that the highest-quality companies, advisors, and vendors are often hard to identify, hard to trust, and hard to match at the right time. Valuable business context exists, but it is trapped in closed workflows or overshared in places that were never designed for selective, trust-based collaboration.

CompanyBoard's thesis is that the next valuable business network will not be built on public social noise. It will be built on verified signal, selective sharing, and explainable trust. Companies should be able to present performance, maturity, and momentum in a structured way without exposing every sensitive metric publicly. Advisors and partners should be able to discover the right companies and the right moments to engage based on real operating context, not vanity branding.

A core part of the product story is niche-market collaboration: the platform should help companies surface credible operating context and connect with complementary partners in a way that supports focused, high-value partnerships. In construction, that might mean collaboration with software providers, suppliers, advisors, or adjacent operators. In other sectors, it could look very different. The principle is the same: help companies find partners where the relationship is structured around mutual value, a clear scope, and a practical outcome.

The product combines four layers into one platform:
- A trusted company identity and profile layer
- A private collaboration and network activity layer
- A metrics, ranking, and trust intelligence layer
- A marketplace and partner matching layer

Over time, this creates more than a directory or social feed. It becomes a system of record for business credibility inside curated networks. Companies use it to manage visibility, prove traction, and unlock better partnerships. Advisors use it to identify where they can add value. Vendors use it to find better-fit customers with warmer, higher-conviction entry points.

At seed scale, the wedge is a premium private network for founders, operators, and growth partners. At platform scale, the opportunity is to become the infrastructure for how trusted business communities evaluate performance, share selectively, collaborate intelligently, and transact with confidence.

If executed well, CompanyBoard can sit at the intersection of professional identity, operating data, private reputation, and partner commerce, turning fragmented relationship-driven workflows into a structured and defensible network product.

## Why Now
Several market shifts make this the right moment for a platform like CompanyBoard.

- Private communities and curated business networks have become meaningful channels for deal flow, operator knowledge, and vendor discovery, but most still run on lightweight tools that do not support structured trust or selective data sharing.
- Founders and operators increasingly expect software to help them manage reputation, workflows, and partner decisions in one place rather than across disconnected spreadsheets, CRMs, Slack groups, and manual introductions.
- AI increases the value of structured operating data and explainable recommendations, but trust only exists when companies can control visibility and understand how recommendations are made.
- B2B buying is moving toward warmer, higher-context introductions, which creates room for a network product that combines credibility, timing, and fit instead of acting like a generic lead marketplace.

In short, the infrastructure for private business networks has not caught up with how modern founders, operators, and partners actually discover, evaluate, and work with each other.

## Business Model
CompanyBoard can monetize through a multi-sided model that expands as the network deepens.

- Company subscriptions: free tier for profile creation and basic participation, with paid tiers for enhanced visibility, advanced analytics, richer benchmarking, and collaboration tools.
- Vendor and partner access: paid placement, premium partner profiles, sponsored discovery, and qualified introduction workflows for high-fit service providers.
- Network and community plans: private cohorts, investor networks, accelerators, and operator communities can pay for branded or managed network environments.
- Workflow and intelligence add-ons: integrations, advanced recommendation tooling, reporting, and operational collaboration features can become premium modules over time.

This creates a model where revenue is tied to trust, workflow depth, and marketplace liquidity rather than pure advertising or low-quality traffic volume.

## Go-To-Market
CompanyBoard should enter through a narrow, high-context wedge rather than a broad social launch.

- First users: founder communities, operator circles, accelerators, investor portfolios, and curated B2B networks where trust and introductions already matter.
- Initial buyer or sponsor: community operators, fund platforms, or network leaders who want stronger visibility, better member engagement, and higher-quality partner discovery.
- Early user value: companies get a structured profile and trusted visibility layer; operators get better benchmarking and collaboration; vendors get warmer, more qualified discovery.
- Why this wedge works: these groups already have dense relationships, repeated interactions, and clear pain around fragmented tools, making them easier to activate than a cold-start public marketplace.

The go-to-market motion should start with a few curated networks, prove engagement and trusted partner discovery inside those environments, and then expand through community-led distribution, portfolio rollouts, and partner referrals.

## Moat / Defensibility
CompanyBoard's defensibility comes from structured trust data, workflow depth, and network-specific reputation rather than from a simple directory or feed.

- Reputation graph: over time the platform accumulates unique trust signals across company quality, selective metric sharing, reviews, collaboration history, and partner outcomes.
- Embedded workflow: once onboarding, benchmarking, recommendations, and partner collaboration live in one system, the product becomes harder to replace with disconnected tools.
- Network density: private communities become more valuable as the system captures more verified companies, trusted experts, and high-performing vendors within each network.
- Explainable intelligence: recommendation quality improves as CompanyBoard learns from structured profile, activity, and outcome data while keeping decision logic legible to users.
- Multi-sided liquidity: defensibility grows as companies, advisors, and vendors each get better results from the presence of the others, creating a compounding marketplace effect.

The long-term moat is not just software. It is the combination of trusted identity, permissioned operating data, workflow history, and network-specific reputation that competitors cannot quickly replicate.

## Guiding Principles
- Keep development local-first and cost-conscious.
- Make trust and selective visibility the core product advantage.
- Favor explainable rankings and recommendations over black-box logic.
- Prioritize simple onboarding and strong user experience over feature sprawl.

## Current Product Foundation
The platform already has the core building blocks for a strong MVP:
- Landing experience and value proposition
- App routing and page-level screens for landing, dashboard, marketplace, onboarding, and company profiles
- Authentication flow
- Dashboard for company profiles and network signals
- Company detail pages
- Marketplace and vendor discovery views
- Community posts and feed interactions
- Local persistence and Docker-based local development

## Roadmap Overview

### Phase 1: Product Hardening and MVP Polish (0-2 weeks)
Focus: make the existing experience feel credible, complete, and ready for real users.

Deliverables:
- Complete core auth hardening including stronger session lifecycle handling
- Finish the onboarding flow for company profiles
- Add validation, completion checkpoints, and visible onboarding progress state
- Improve empty, loading, and error states across the app
- Add editable company profile fields and better profile completion logic
- Continue breaking large UI logic into clearer page-level and reusable component boundaries where needed
- Strengthen auth and session handling
- Add coverage for the most important user flows

Success criteria:
- New users can sign up, create a profile, and reach the dashboard without friction
- Core screens feel polished enough for early demos

### Phase 2: Trust, Privacy, and Profile Quality (2-6 weeks)
Focus: make the platform feel differentiated through selective sharing and trust signals.

Deliverables:
- Replace any remaining volatile in-memory paths with durable database-backed flows
- Persist users, companies, vendors, meetings, posts, and session-aware auth data consistently
- Formalize company profile completeness and quality scoring
- Add an integrations center scaffold for systems such as QuickBooks, HubSpot, and API key-based connections
- Show connection state, sync health, and setup status for each integration
- Add stronger privacy controls for metrics visibility
- Introduce review and rating signals for companies and sessions
- Improve ranking explanations so users understand why a profile is promoted
- Add clear approval states for metrics sharing and meeting visibility
- Harden validation, error handling, and route protection across the API

Success criteria:
- Users can control what is visible and when
- Restarting the backend does not lose important application data
- Profiles feel more credible and easier to trust

### Phase 3: Network Activation and Collaboration (6-10 weeks)
Focus: turn the platform into a real working network rather than a static directory.

Deliverables:
- Expand the community feed into a richer activity stream
- Add advisory request and peer support workflows
- Support meeting scheduling and session coordination
- Add a social activity planner with calendar views, draft queue support, and approval workflows
- Add user profiles plus social primitives such as follows, comments, likes, and notifications
- Introduce invite-based access for private cohorts and communities
- Add basic moderation and visibility controls for posts and sessions
- Add content privacy actions such as hide, block, or restricted visibility where appropriate
- Add a metrics dashboard with trend lines and next-best-action recommendations
- Add collaboration intent prompts so users can describe the kind of partnership they want, such as a niche-market pilot, advisory engagement, software integration, or adjacent operator relationship

Success criteria:
- Users can participate in useful conversations and sessions
- The network becomes active rather than passive
- Users can articulate collaboration intent in a way that supports higher-quality partner discovery

### Phase 4: Marketplace Intelligence and Partner Matching (10-14 weeks)
Focus: make vendor discovery and partner recommendations more practical and outcome-driven.

Deliverables:
- Improve match scoring for vendors using fit, category, budget, availability, and outcomes
- Add vendor case studies, service details, and proof points
- Make recommendations explainable and actionable
- Add a vendor collaboration workspace with tasks, comments, ownership, and deadlines
- Support intro and deal tracking for premium partner matches
- Add filtering and search for marketplace discovery
- Add partnership framing templates for niche collaborations, including collaboration intent, scope, and value exchange
- Add support for complementary-partner discovery such as software firms, advisors, suppliers, and adjacent operators

Success criteria:
- Vendor recommendations feel relevant and useful
- Users can move from profile review to partner action with less friction
- The platform supports structured, mutual-value partnerships rather than generic networking alone

### Phase 5: Monetization and Growth Operations (3-6 months)
Focus: turn the product into a sustainable service with clearer value tiers.

Deliverables:
- Define free, premium, and partner-facing plans
- Add premium visibility, analytics, and enhanced partner access
- Introduce admin tools for moderation, approvals, and user management
- Add billing and subscription support if needed
- Build reporting for network health and engagement

Success criteria:
- The platform can support early paid usage or partner-led growth
- Admins can manage the network without manual overhead

### Phase 6: Scale, Reliability, and Launch Readiness (6+ months)
Focus: prepare the product for broader adoption and long-term operation.

Deliverables:
- Improve reliability, observability, and automated testing
- Introduce CI/CD pipelines and staging environments
- Harden deployment on cloud infrastructure
- Add stronger security, permissions, and compliance controls
- Improve mobile experience and accessibility
- Add strong metadata and growth infrastructure including page titles, descriptions, canonical URLs, and social sharing quality

Success criteria:
- The platform is stable enough for a wider release
- The team can ship safely and repeatedly

### Phase 7: SEO, Metadata, and Discoverability Layer (ongoing)
Focus: improve landing discoverability, social sharing quality, and conversion from public traffic.

Deliverables:
- Add proper SEO metadata for landing and key public pages
- Implement Open Graph and social share metadata
- Add image assets, canonical URLs, and reusable metadata patterns
- Improve preview quality for links shared on social and messaging platforms

Success criteria:
- Shared links render with strong previews
- Public pages are easier to index and understand

## Technical Roadmap

### Frontend
- Continue improving the React/Vite experience
- Add profile editing, richer dashboard widgets, and improved mobile layouts
- Improve state handling for company and marketplace workflows
- Introduce reusable components for onboarding, reviews, and vendor cards
- Add progress-aware onboarding, integration status views, planner UI, and collaboration workspace surfaces

### Backend
- Expand the API around company profiles, permissions, reviews, and marketplace matching
- Add structured services for ranking, recommendations, and visibility policy
- Introduce event-driven or background workflows for notifications and sync tasks
- Ensure auth is session-aware with protected routes, token handling, and durable persistence
- Add integration connection endpoints, planner workflows, collaboration objects, and recommendation support for next-best actions

### Data Layer
- Extend the PostgreSQL schema for reviews, sessions, marketplace interactions, and profile history
- Add schema support for follows, likes, comments, notifications, and moderation/privacy flags
- Add support for integration credentials/status metadata, planner items, task ownership, deadlines, and trend snapshots
- Improve backup/restore reliability and data retention strategy
- Add indexes and reporting views for analytics and ranking logic

### DevOps and Delivery
- Keep Docker as the local-first development path
- Introduce CI checks and automated deployment workflows
- Prepare a lean production stack for cloud deployment with backup and monitoring
- Deploy the frontend to S3 plus CloudFront
- Deploy the backend to ECS/Fargate or EC2
- Use RDS PostgreSQL for production persistence
- Set up environment-based config, HTTPS, and deployment documentation

## Suggested Milestones
- Milestone 1: Users can create and edit company profiles, and privacy controls work end to end
- Milestone 2: Community sessions, reviews, and advisory workflows are live
- Milestone 3: Marketplace matching is explainable and useful for real partner discovery
- Milestone 4: Premium tiers and admin operations are available

## Key Success Metrics
- Number of completed company profiles
- Profile completion rate
- Weekly active users and repeat visits
- Number of sessions, introductions, and marketplace interactions
- Conversion from free to premium or partner-facing usage

## Recommended Next Sprint Focus
1. Finish onboarding and profile editing
2. Make metrics-sharing controls explicit and easier to understand
3. Add one polished network interaction such as meetings or advisory requests
4. Introduce a lightweight collaboration-intent workflow for niche partnerships and partner discovery
5. Prepare the product for a small pilot group

## Design Sprint: CompanyBoard UI v1 (3 days)

### Day 1: Design Lock
1. Finalize one hero direction in Figma.
2. Finalize landing section order: hero, proof, value pillars, preview, CTA.
3. Define design tokens once: colors, typography scale, spacing, radius, and shadows.
4. Build reusable components: primary button, secondary button, section header, card, and stat pill.
5. Freeze copy for hero and top landing sections.

Done criteria:
- One clean desktop landing frame is approved.
- One clean mobile landing frame is approved.
- No conflicting visual styles remain.

### Day 2: Code Translation
1. Normalize CSS variables to match the design tokens.
2. Update hero styling first.
3. Update landing sections second.
4. Apply the same token system to the dashboard top shell.
5. Keep page structure stable while replacing the visual layer.

Done criteria:
- Landing and dashboard feel like one consistent brand.
- Typography, spacing, buttons, and cards follow the same token system.

### Day 3: Polish and Consistency
1. Align auth and marketplace surfaces with the same token set.
2. Run responsive QA for core breakpoints.
3. Resolve visual mismatches in spacing, card height, and typography rhythm.
4. Validate social assets and metadata consistency.
5. Run final build and a full click-through pass.

Done criteria:
- Desktop and mobile both feel intentional and coherent.
- No legacy visual style leaks into primary screens.
- The product is demo-ready.

### Daily Timebox
1. 90 minutes focused implementation.
2. 20 minutes visual QA.
3. 10 minutes notes for next-day adjustments.
