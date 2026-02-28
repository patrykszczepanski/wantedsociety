# CLAUDE.md — Wanted Society Website

## Project Overview

Wanted Society is a Polish automotive events organization (stance meets) based in Lublin voivodeship. This is their website for event applications, gallery, shop, and contact.

**Language**: Polish UI (page names, labels, form text). English code/comments.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Database**: Supabase (PostgreSQL 17)
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york style)
- **Auth**: Custom session-based auth with bcryptjs (NOT Supabase Auth)
- **Validation**: Zod 4
- **Forms**: react-hook-form + @hookform/resolvers
- **Email**: Resend
- **Icons**: lucide-react
- **Theme**: next-themes (dark mode only)

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # /logowanie, /rejestracja, /email-niepotwierdzony
│   ├── (protected)/      # /zgloszenia (requires auth + email confirmation)
│   ├── (public)/         # /kontakt, /galeria, /sklep
│   ├── admin/            # /admin/zgloszenia, /admin/uzytkownicy, /admin/galeria, /admin/sklep
│   ├── api/              # API routes (see below)
│   ├── globals.css       # Tailwind imports + brand theme variables
│   ├── layout.tsx        # Root layout (Inter + Oswald fonts)
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # shadcn components
│   ├── layout/           # Navbar, Footer
│   ├── landing/          # Landing page sections
│   ├── applications/     # Application forms & lists
│   ├── gallery/          # Gallery display
│   ├── shop/             # Product display
│   └── shared/           # Reusable components
├── lib/
│   ├── auth.ts           # Session management, password hashing
│   ├── types.ts          # TypeScript interfaces
│   ├── utils.ts          # cn() utility
│   ├── constants.ts      # Site name, nav links, application types/statuses
│   ├── supabase/
│   │   ├── admin.ts      # Service role client (for API routes)
│   │   ├── realtime.ts   # Anon key client (for realtime subscriptions)
│   │   └── storage.ts    # getPublicStorageUrl() helper
│   ├── validations/
│   │   └── application.ts  # Zod schemas for exhibitor/media/partner
│   └── email/
│       ├── resend.ts     # Resend client singleton
│       └── templates/    # Email templates
├── middleware.ts          # Route protection (session + role checks)
supabase/
├── config.toml           # Local dev config
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_fix_handle_new_user.sql
    ├── 003_custom_auth.sql
    └── 004_restore_foreign_keys.sql
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (server-only)
RESEND_API_KEY=                  # Resend email service key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=                     # Recipient for contact form emails
FROM_EMAIL=                      # Sender email (defaults to onboarding@resend.dev)
```

## Database Schema (8 tables)

### profiles
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | `gen_random_uuid()` |
| email | TEXT UNIQUE NOT NULL | |
| full_name | TEXT NOT NULL | |
| instagram_handle | TEXT | nullable |
| password_hash | TEXT NOT NULL | bcrypt hash |
| email_confirmed_at | TIMESTAMPTZ | null = unconfirmed |
| role | TEXT | `'user'` or `'admin'` |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | auto-updated via trigger |

### sessions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | session token stored in cookie |
| user_id | UUID FK → profiles | ON DELETE CASCADE |
| expires_at | TIMESTAMPTZ | 30 days from creation |
| created_at | TIMESTAMPTZ | |

### applications
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → profiles | ON DELETE CASCADE |
| type | TEXT | `'exhibitor'`, `'media'`, `'partner'` |
| status | TEXT | `'pending'`, `'accepted'`, `'rejected'` |
| data | JSONB | Type-specific form data |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| | | UNIQUE(user_id, type) |

### application_messages
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| application_id | UUID FK → applications | ON DELETE CASCADE |
| sender_id | UUID FK → profiles | ON DELETE CASCADE |
| content | TEXT | |
| is_admin | BOOLEAN | |
| created_at | TIMESTAMPTZ | |

### application_photos
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| application_id | UUID FK → applications | ON DELETE CASCADE |
| storage_path | TEXT | Path in `application-photos` bucket |
| file_name | TEXT | |
| file_size | INT | |
| sort_order | INT | |
| created_at | TIMESTAMPTZ | |

### gallery_items
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| storage_path | TEXT | Path in `gallery` bucket |
| thumbnail_path | TEXT | nullable |
| media_type | TEXT | `'image'` or `'video'` |
| title | TEXT | nullable |
| description | TEXT | nullable |
| event_name | TEXT | nullable |
| sort_order | INT | |
| is_published | BOOLEAN | default true |
| created_at | TIMESTAMPTZ | |

### products
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | TEXT NOT NULL | |
| description | TEXT | nullable |
| price_pln | NUMERIC(10,2) | nullable |
| show_price | BOOLEAN | default true |
| instagram_contact_url | TEXT | nullable |
| is_published | BOOLEAN | default true |
| sort_order | INT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### product_images
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| product_id | UUID FK → products | ON DELETE CASCADE |
| storage_path | TEXT | Path in `products` bucket |
| is_primary | BOOLEAN | default false |
| sort_order | INT | |

**RLS is disabled on all tables** — access control is handled at the API layer using the service role client.

## Custom Auth System

The project uses a **custom session-based auth** system, NOT Supabase Auth.

### How it works
1. Passwords are hashed with `bcryptjs` (12 salt rounds) — see `src/lib/auth.ts`
2. On login, a `sessions` row is created and the UUID is stored in an HTTP-only cookie (`session_id`)
3. Sessions expire after 30 days
4. Cookie settings: `httpOnly`, `secure` in production, `sameSite: 'lax'`
5. `src/middleware.ts` validates the session on every request to protected routes

### Key auth functions (`src/lib/auth.ts`)
- `hashPassword(password)` — bcrypt hash
- `verifyPassword(password, hash)` — bcrypt compare
- `createSession(userId)` — insert session + set cookie
- `getSession()` — read cookie, fetch session + profile
- `getCurrentUser()` — returns profile or null
- `destroySession()` — delete session row + clear cookie

### Middleware route protection (`src/middleware.ts`)
- `/zgloszenia` — requires valid session + `email_confirmed_at` not null
- `/admin/**` — requires valid session + `role === 'admin'`
- Unauthorized users redirected to `/logowanie?redirect=<original_path>`

## API Routes

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register (email, password, full_name) |
| POST | `/api/auth/login` | Login (email, password) |
| POST | `/api/auth/logout` | Destroy session |
| GET | `/api/auth/me` | Get current user profile |

### Applications
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/applications` | List user's applications |
| POST | `/api/applications` | Create application (enforces unique per type) |
| GET | `/api/applications/[id]` | Get application detail |
| PATCH | `/api/applications/[id]` | Update status (admin) |
| POST | `/api/applications/upload` | Upload photos to `application-photos` bucket |
| GET | `/api/applications/[id]/messages` | Get messages |
| POST | `/api/applications/[id]/messages` | Send message |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/applications` | List all applications |
| GET | `/api/admin/users` | List all users |
| PATCH | `/api/admin/users/[id]` | Update user (email confirmation) |
| GET | `/api/admin/gallery` | List gallery items |
| POST | `/api/admin/gallery` | Create gallery item |
| POST | `/api/admin/gallery/upload` | Upload gallery media |
| PATCH | `/api/admin/gallery/[id]` | Update gallery item |
| DELETE | `/api/admin/gallery/[id]` | Delete gallery item |
| GET | `/api/admin/products` | List products |
| POST | `/api/admin/products` | Create product |
| POST | `/api/admin/products/upload` | Upload product images |
| PATCH | `/api/admin/products/[id]` | Update product |
| DELETE | `/api/admin/products/[id]` | Delete product |

### Other
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/email` | Send contact form email (Resend) |

## Supabase Client Patterns

### Admin client (`src/lib/supabase/admin.ts`)
Used in **all API routes**. Creates a client with `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS.
```ts
const supabase = createAdminClient();
```

### Realtime client (`src/lib/supabase/realtime.ts`)
Used on the **client side** for real-time subscriptions. Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Storage URLs (`src/lib/supabase/storage.ts`)
```ts
getPublicStorageUrl(bucket, path)
// → {SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
```

### Storage buckets
- `application-photos` — user application uploads
- `gallery` — gallery media (public)
- `products` — product images (public)

## Migration History

1. **001_initial_schema.sql** — Created profiles (linked to auth.users), applications, application_messages, application_photos, gallery_items, products, product_images
2. **002_fix_handle_new_user.sql** — Fixed the profile auto-creation trigger
3. **003_custom_auth.sql** — Migrated from Supabase Auth to custom auth: dropped auth.users trigger/FK, added password_hash + email_confirmed_at to profiles, created sessions table, disabled RLS on all tables. Note: `DROP CONSTRAINT ... CASCADE` on profiles PK accidentally dropped FKs from applications and application_messages
4. **004_restore_foreign_keys.sql** — Restored the two foreign keys (`applications.user_id` and `application_messages.sender_id`) that were dropped by the CASCADE in migration 003

## Development Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Key Patterns

### cn() utility (`src/lib/utils.ts`)
Combines `clsx` + `tailwind-merge` for conditional class names:
```ts
cn("px-4", isActive && "bg-primary", className)
```

### Brand colors (defined in `globals.css`)
- `brand-black`: #1A1A1A (background)
- `brand-red`: #E8344E (primary/accent)
- `brand-gold`: #FFD700
- `brand-teal`: #0D7377 (secondary accent)

### Fonts
- **Body**: Inter (sans)
- **Headings**: Oswald

### Role checks in API routes
```ts
const user = await getCurrentUser();
if (!user || user.role !== 'admin') return NextResponse.json({ error: '...' }, { status: 403 });
```

### Path alias
`@/*` maps to `./src/*` — use `@/lib/auth`, `@/components/ui/button`, etc.

### Application data in JSONB
The `applications.data` column stores type-specific data:
- **exhibitor**: `{ car_name, modification_description, instagram_handle, photo_paths }`
- **media**: `{ instagram_handle, portfolio_url?, experience_description }`
- **partner**: `{ contact_number, company_name, application_description }`
