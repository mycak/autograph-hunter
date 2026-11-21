---
name: autograph-hunter-parallel-scan
description: Coordinate parallel Autograph Hunter marketplace agents, combine reviewed source reports, preserve the three favorite players, and publish one verified update with deduplicated price alerts.
---

# Parallel Autograph Hunter scan

Use the user's existing authorization to research marketplaces in parallel. This does not authorize purchases, seller messages, paid access, or changing account permissions. Do not create new user chats for subtasks; use available subagent/delegation tools.

## Scope and favorites

Read `site/data/watchlist.json`, `docs/agent-monitoring.md`, `site/data/excluded-offers.json`, and current source statuses before dispatching work. The saved favorites are Zinedine Zidane (`zidane`), Cristiano Ronaldo (`ronaldo`), and Ronaldo Nazário/R9 (`nazario`). Never merge R9 with Cristiano, infer identity from “Ronaldo” alone, or reset favorites during an import. Cards must be Topps/Panini; shirts must actually carry a handwritten signature.

Six mandatory daily sources: eBay, COMC, Catawiki, Allegro Lokalnie, All Star Signings, Icons.com. Nine additional source skills are available for explicitly requested wider scans; their existence is not evidence that they have been scanned or are connected to daily monitoring.

## Dispatch independent work

Read the relevant sibling `.agents/skills/autograph-hunter-<source>/SKILL.md` and assign one source to one worker where slots permit. With limited slots, queue remaining sources or give a worker an explicit, bounded set. If splitting a large source further, use disjoint player/category groups or exact listing IDs and unique filenames.

Give each worker:

- The source skill and relevant raw existing offers, not another worker's conclusions.
- The favorites, category scope, PLN800 strict threshold and fixed-price-only alert rule.
- A unique absolute output path under the current chat's `work/<run-id>/`, plus a separate findings path.
- Instructions to read current details and visually inspect signature images, record actual timestamps, uncertain costs as null, source currency, availability and PL delivery. API results and cached search text are leads, not signature proof. `unverified` means authenticity is unconfirmed; it does not excuse missing visible signature.
- No permission to edit common `site/data/offers.json`, import, change branches, publish, or record an alert as sent. Workers report opportunities immediately to the coordinator, who owns deduplication and notification delivery.

The offer report contract is `{ "schemaVersion": 1, "offers": [...] }`, compatible with `site/data/example.json`. Every active offer requires `signatureEvidence` with `visibleSignature=true`, an observed HTTPS `imageUrl` and a precise note locating the signature. Mark catalogue images explicitly. Keep actual inspected `lastSeen`; the importer preserves existing `firstSeen` and history.

Each findings report records source, attempted player/category scope, detail/image counts, accepted and rejected IDs with reasons, failed or blocked steps and timestamps. Empty offers plus a blocker is not a successful zero-result scan. No worker reads or emits credentials. Use `autograph-hunter-access` for authorized account operations only in the coordinator.

## eBay discovery and review

Production API is active. GitHub Actions retrieves candidates into the `ebay-candidates-for-review` artifact; API candidates remain inactive and do not refresh published offer timestamps. Authorized local collection can load the existing ignored `.env` privately and run `scripts/refresh.py --candidates-file <private-path>`. Never echo secrets or commit candidate scratch data. Get current item details and compare original currencies (`convertedFromValue`/`convertedFromCurrency` when present), shipping eligibility, availability, description and images before accepting.

## Combine once, then publish once

After workers finish, inspect their reports and conflicts. Match cross-market physical duplicates using genuinely observed serial/certificate numbers, never player/title alone. If one worker cannot browse, reassign its bounded task to a worker with access or record the actual blocker; do not fabricate results.

Run `python3 scripts/merge-agent-reports.py <reports...> --out <combined.json>`; conflicting IDs/URLs fail before output replacement. Then the coordinator alone runs `python3 scripts/import-agent.py <combined.json>`. Missing from bounded search is not proof of sale. Do not refresh dates for records that were not checked.

Use saved NBP rates and the same subtotal as the frontend (item + known shipping + known fees) to evaluate newly seen or newly crossing fixed-price offers strictly below 800 PLN. Auctions never trigger this alert. For incomplete costs say “od” and name missing costs. Inspect `work/autograph-alert-state.json`; notify first, record dedup state only after delivery, and never call an unverified signature a confirmed original.

Update `site/data/agent-scan.json` and source attempt statuses from actual findings, preserving earlier successes/dates when today's check failed. Run `npm run check`, `node scripts/validate.mjs`, inspect changes, and publish through the Personal/mycak GitHub connector. Never overwrite concurrent remote data; base the update on the latest default-branch state. Wait for Pages and verify its public JSON before claiming publication. Keep existing schedules and unrelated automations unchanged unless requested.
