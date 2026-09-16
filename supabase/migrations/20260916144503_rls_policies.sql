-- =========================================================
-- Row Level Security Policies
-- IT Asset & Support Ticket Management
-- =========================================================

-- ---------------------------------------------------------
-- Enable Row Level Security
-- Policies are defined below to control access by role.
-- ---------------------------------------------------------

ALTER TABLE public.profiles
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tickets
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.ticket_notes
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.assets
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.asset_assignments
    ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------
-- Private Schema
-- Contains internal authorization helper functions that
-- should not be exposed through the Data API.
-- ---------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;

GRANT USAGE ON SCHEMA private TO authenticated;



-- ---------------------------------------------------------
-- Authorization Helper Functions
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION private.is_administrator()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = (SELECT auth.uid())
          AND role = 'Administrator'
    );
$$;

REVOKE ALL ON FUNCTION private.is_administrator() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION private.is_administrator()
TO authenticated;


-- ---------------------------------------------------------
-- Profiles Policies
-- Employees can view their own profile.
-- Administrators can view all profiles.
-- ---------------------------------------------------------

CREATE POLICY "Employees can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    id = (SELECT auth.uid())
);

CREATE POLICY "Administrators can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    (SELECT private.is_administrator())
);


-- Administrators can update user profiles, including roles.
CREATE POLICY "Administrators can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
    (SELECT private.is_administrator())
)
WITH CHECK (
    (SELECT private.is_administrator())
);



-- ---------------------------------------------------------
-- Tickets Policies
-- Employees can view their own tickets.
-- Administrators can view all tickets.
-- ---------------------------------------------------------

CREATE POLICY "Employees can view own tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (
    user_id = (SELECT auth.uid())
);

CREATE POLICY "Administrators can view all tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (
    (SELECT private.is_administrator())
);


-- Employees can create tickets only for themselves.
CREATE POLICY "Employees can create own tickets"
ON public.tickets
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = (SELECT auth.uid())
);

-- Administrators can update all tickets.
CREATE POLICY "Administrators can update tickets"
ON public.tickets
FOR UPDATE
TO authenticated
USING (
    (SELECT private.is_administrator())
)
WITH CHECK (
    (SELECT private.is_administrator())
);



-- ---------------------------------------------------------
-- Ticket Notes Policies
-- Internal ticket notes are accessible only to administrators.
-- ---------------------------------------------------------

CREATE POLICY "Administrators can view ticket notes"
ON public.ticket_notes
FOR SELECT
TO authenticated
USING (
    (SELECT private.is_administrator())
);

CREATE POLICY "Administrators can create ticket notes"
ON public.ticket_notes
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT private.is_administrator())
    AND admin_user_id = (SELECT auth.uid())
);



-- ---------------------------------------------------------
-- Assets Policies
-- Employees can view assets currently assigned to them.
-- Administrators can fully manage assets.
-- ---------------------------------------------------------

CREATE POLICY "Employees can view assigned assets"
ON public.assets
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.asset_assignments
        WHERE asset_assignments.asset_id = assets.id
          AND asset_assignments.user_id = (SELECT auth.uid())
          AND asset_assignments.returned_date IS NULL
    )
);

CREATE POLICY "Administrators can view all assets"
ON public.assets
FOR SELECT
TO authenticated
USING (
    (SELECT private.is_administrator())
);

CREATE POLICY "Administrators can create assets"
ON public.assets
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT private.is_administrator())
);

CREATE POLICY "Administrators can update assets"
ON public.assets
FOR UPDATE
TO authenticated
USING (
    (SELECT private.is_administrator())
)
WITH CHECK (
    (SELECT private.is_administrator())
);

CREATE POLICY "Administrators can delete assets"
ON public.assets
FOR DELETE
TO authenticated
USING (
    (SELECT private.is_administrator())
);


-- ---------------------------------------------------------
-- Asset Assignments Policies
-- Employees can view their own assignment records.
-- Administrators can manage asset assignments.
-- ---------------------------------------------------------

CREATE POLICY "Employees can view own asset assignments"
ON public.asset_assignments
FOR SELECT
TO authenticated
USING (
    user_id = (SELECT auth.uid())
);

CREATE POLICY "Administrators can view all asset assignments"
ON public.asset_assignments
FOR SELECT
TO authenticated
USING (
    (SELECT private.is_administrator())
);

CREATE POLICY "Administrators can create asset assignments"
ON public.asset_assignments
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT private.is_administrator())
);

CREATE POLICY "Administrators can update asset assignments"
ON public.asset_assignments
FOR UPDATE
TO authenticated
USING (
    (SELECT private.is_administrator())
)
WITH CHECK (
    (SELECT private.is_administrator())
);