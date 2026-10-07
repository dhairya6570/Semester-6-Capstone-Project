-- ---------------------------------------------------------
-- Administrator Ticket Delete Policy
-- ---------------------------------------------------------
-- Administrators can delete tickets.
-- Required for F3.9: Admin deletes tickets.
-- ---------------------------------------------------------

CREATE POLICY "Administrators can delete tickets"
ON public.tickets
FOR DELETE
TO authenticated
USING (
    (SELECT private.is_administrator())
);