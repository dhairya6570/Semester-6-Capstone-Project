-- =========================================================
-- IT Asset & Support Ticket Management
-- Initial Database Schema
-- =========================================================

-- ---------------------------------------------------------
-- Profiles
-- Application-specific user information.
-- Authentication credentials are managed by Supabase Auth.
-- ---------------------------------------------------------

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    full_name VARCHAR(100) NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'Employee'
        CHECK (role IN ('Employee', 'Administrator')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ---------------------------------------------------------
-- Tickets
-- Support tickets submitted by employees.
-- ---------------------------------------------------------

CREATE TABLE public.tickets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id UUID NOT NULL
        REFERENCES public.profiles(id),

    title VARCHAR(100) NOT NULL,

    description VARCHAR(1000) NOT NULL,

    category VARCHAR(30) NOT NULL
        CHECK (
            category IN (
                'Hardware Issue',
                'Software Issue',
                'Network Issue',
                'Access Request',
                'Other'
            )
        ),

    status VARCHAR(20) NOT NULL DEFAULT 'Open'
        CHECK (
            status IN (
                'Open',
                'In Progress',
                'Resolved',
                'Closed'
            )
        ),

    priority VARCHAR(10)
        CHECK (
            priority IS NULL
            OR priority IN ('Low', 'Medium', 'High')
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    status_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ---------------------------------------------------------
-- Ticket Notes
-- Internal notes added to tickets by administrators.
-- Employee access will be restricted through RLS and RBAC.
-- ---------------------------------------------------------

CREATE TABLE public.ticket_notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    ticket_id BIGINT NOT NULL
        REFERENCES public.tickets(id)
        ON DELETE CASCADE,

    admin_user_id UUID NOT NULL
        REFERENCES public.profiles(id),

    note_text TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ---------------------------------------------------------
-- Assets
-- IT assets managed by administrators.
-- ---------------------------------------------------------

CREATE TABLE public.assets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    asset_code VARCHAR(20) UNIQUE,

    asset_name VARCHAR(100) NOT NULL,

    asset_type VARCHAR(30) NOT NULL
        CHECK (
            asset_type IN (
                'Desktop Computer',
                'Laptop',
                'Monitor',
                'Keyboard',
                'Mouse',
                'Printer',
                'Software License',
                'Other'
            )
        ),

    serial_number VARCHAR(100) NOT NULL UNIQUE,

    purchase_date DATE NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



-- ---------------------------------------------------------
-- Asset Assignments
-- Tracks current and historical asset assignments.
-- An assignment is active while returned_date is NULL.
-- ---------------------------------------------------------

CREATE TABLE public.asset_assignments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    asset_id BIGINT NOT NULL
        REFERENCES public.assets(id),

    user_id UUID NOT NULL
        REFERENCES public.profiles(id),

    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,

    returned_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (
        returned_date IS NULL
        OR returned_date >= assigned_date
    )
);
