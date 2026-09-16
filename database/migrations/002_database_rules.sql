-- ---------------------------------------------------------
-- Indexes
-- Improve common lookups and enforce assignment rules.
-- ---------------------------------------------------------

-- Tickets are frequently retrieved by the employee who
-- submitted them.
CREATE INDEX idx_tickets_user_id
    ON public.tickets(user_id);

-- Supports ticket filtering by status.
CREATE INDEX idx_tickets_status
    ON public.tickets(status);

-- Supports ticket sorting by creation date.
CREATE INDEX idx_tickets_created_at
    ON public.tickets(created_at);

-- Supports retrieving notes belonging to a ticket.
CREATE INDEX idx_ticket_notes_ticket_id
    ON public.ticket_notes(ticket_id);

-- Supports retrieving an employee's asset assignments.
CREATE INDEX idx_asset_assignments_user_id
    ON public.asset_assignments(user_id);

-- Supports retrieving assignment history for an asset.
CREATE INDEX idx_asset_assignments_asset_id
    ON public.asset_assignments(asset_id);

-- An asset can have only one active assignment.
-- Historical assignments are still allowed.
CREATE UNIQUE INDEX idx_one_active_assignment_per_asset
    ON public.asset_assignments(asset_id)
    WHERE returned_date IS NULL;



-- ---------------------------------------------------------
-- Updated At Trigger
-- Automatically updates updated_at whenever a row changes.
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_assets_updated_at
    BEFORE UPDATE ON public.assets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();


-- ---------------------------------------------------------
-- Ticket Status Change Trigger
-- Updates status_changed_at only when ticket status changes.
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_ticket_status_changed_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.status_changed_at = NOW();
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tickets_status_changed_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_ticket_status_changed_at();


-- ---------------------------------------------------------
-- Asset Code Trigger
-- Generates human-readable asset codes such as AST-0001.
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_asset_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.asset_code = 'AST-' || LPAD(NEW.id::TEXT, 4, '0');

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_assets_set_asset_code
    BEFORE INSERT ON public.assets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_asset_code();