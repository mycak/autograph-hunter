-- Apply after deletion-workflow.sql. Keep case lookups and the active queue bounded.
create index ebay_deletion_audit_request_idx on public.ebay_deletion_audit(notification_id);
create index ebay_deletion_open_queue_idx on public.ebay_deletion_requests(received_at)
where status in ('pending','processing');
