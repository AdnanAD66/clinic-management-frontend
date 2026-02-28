# AI Clinic Management SaaS – Project Constitution

## Core Principles

### I. Spec Is Law
The clarified spec (`spec.md`) is the single source of truth. No feature, endpoint, or UI element exists unless it traces back to a spec requirement. If the spec doesn't say it, we don't build it.

### II. No Feature Creep
Reject all additions not in the spec. No "nice-to-haves" during implementation. If a gap is found, pause and clarify against spec before writing code. Scope is fixed.

### III. Deterministic Behavior
All outputs must be reproducible given the same inputs. No randomness unless the spec explicitly requires it. Seeded values for any simulation (e.g., revenue calculation = appointments × 500). No magic numbers without named constants.

### IV. Readability Over Cleverness
Code is written to be read by humans under time pressure (hackathon judges). Prefer explicit over implicit. No abbreviations in variable/function names. Every file should be understandable without reading other files first.

### V. Fail Explicitly
All errors produce clear, user-facing messages. API errors return consistent format: `{ success: false, message: string }`. AI failures show "AI temporarily unavailable" — never silent failures. No swallowed exceptions.

### VI. Role Boundaries Are Hard Walls
Each user role (Admin, Doctor, Receptionist, Patient) has exactly the permissions listed in spec. No role can access another role's endpoints or views. Middleware enforces this — never rely on UI-only hiding.

## Quality Standards

### Code
- No `any` types in TypeScript (use proper interfaces)
- No inline styles — use consistent styling approach
- No hardcoded strings for user-facing text — use constants
- No business logic in route handlers — extract to services
- No direct DB queries in controllers — use data access layer

### API Design
- RESTful conventions: proper HTTP verbs and status codes
- All endpoints require authentication except login/register
- All inputs validated server-side (client validation is UX, not security)
- Response shape is consistent across all endpoints

### Testing
- Every API endpoint must be testable via REST client or Postman
- AI features must work when API key is valid AND degrade gracefully when it's not
- All 4 roles must be demo-able end-to-end

### Git
- Atomic commits — one logical change per commit
- Commit messages: `type: description` (e.g., `feat: add appointment booking API`)
- No compiled/generated files committed (node_modules, .next, dist)
- No secrets in repo — use environment variables

## Decision Framework

When facing an implementation choice:

1. **Does the spec address this?** → Follow the spec.
2. **Is it ambiguous?** → Check the clarified requirements table in spec.md.
3. **Still unclear?** → Choose the simpler option. Document the decision.
4. **Two approaches, equal complexity?** → Choose the more readable one.
5. **Tempted to add something extra?** → Don't. See Principle II.

## Architecture Constraints

- **Stack:** MongoDB + Express.js + React.js + Node.js (MERN)
- **Auth:** JWT with role-based middleware
- **AI:** Gemini/OpenAI API via backend proxy endpoint only (never expose keys to client)
- **Storage:** Cloudinary or Supabase Storage for file uploads
- **Charts:** Chart.js or Recharts
- **PDF:** Server-side or client-side generation (jsPDF / pdfkit)
- **Deployment:** Frontend on Vercel/Netlify, Backend on Render/Railway

## Governance

- This constitution supersedes personal preferences and past habits.
- The clarified spec supersedes this constitution on any requirement-level conflict.
- Amendments require explicit discussion and documented reasoning.
- When in doubt, ship less but ship correct.

[GOVERNANCE_RULES]
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
