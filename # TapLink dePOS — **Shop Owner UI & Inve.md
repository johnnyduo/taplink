# TapLink dePOS — **Shop Owner UI & Inventory System** (detailed spec for Sonnet 4)

Nice — below is a focused, developer-ready spec for the **Shop Owner** interface and the **Inventory system**, formatted so you can hand it to Sonnet 4 (or any frontend/dev team) and they’ll have everything needed to implement pixel-perfect, bug-free features. It matches the dark, cinematic, futuristic design tokens we agreed on and includes flows, components, API contracts, edge cases, accessibility, mock data, and acceptance criteria.

---

# Overview (one line)

A modern Shop Owner dashboard that lets SME owners manage products, inventory, NFC tag writing/locking, view sales and payouts, export tax-ready reports, and monitor live transactions — mobile-first but optimized for desktop management.

# Main goals

* Clear real-time view of sales & stock for day-to-day operations
* Fast editing/writing of NFC stickers (write & lock flow)
* Reliable inventory integrity (optimistic UI + server reconciliation)
* Audit-ready tax/export reports and batch anchor visibility
* Delightful, secure UX (password-protected writes, role checks)

---

# Primary user persona

**SME Shop Owner**: non-technical, daily operator. Needs quick updates, low friction NFC write, and accurate sales/tax info. Will use desktop for batch ops and mobile for quick writes.

---

# Top-level pages (desktop + mobile)

1. **Owner Dashboard (Home)** — KPIs, recent sales, low-stock alerts.
2. **Inventory** — List, search, filter, bulk edit, add product, stock adjustments.
3. **Product Detail / Edit** — deep edit, image, pricing, SKU, write/tag control.
4. **NFC Writer (Write Tag)** — guided write flow with password locking and rollback.
5. **Sales Feed** — realtime list, filter, export, view receipt NFT details.
6. **Payouts & Vault** — settlement schedule, vault balance (ERC-4626), anchor tx history.
7. **Reports & Exports** — tax-ready CSV/PDF, custom date ranges.
8. **Settings & Keys** — merchant key management, location (Mapbox), team roles.

---

# Component catalog (with behaviours)

## KPI tiles (Dashboard)

* Revenue Today, Tx Count, Pending Payouts, Low Stock Count, Vault Balance.
* Each tile: glass card, icon, main number, small delta indicator (▲▼ %).
* Live update via websocket.

## Inventory Table / Grid

* Columns: Image, SKU, Name, Price (₩), Stock, Status (Writable/Locked), Quick Actions (Edit, Write Tag, Decrement, Add Stock).
* Features: inline edit for stock & price (click-to-edit), row highlight on low stock (< threshold).
* Bulk select + bulk actions (Export, Write Tag Batch - simulation).

## Product Card / Edit Modal

* Fields: ProductID, SKU, Name, Description, PriceKRW, Stock, BatchID, Images, Tags (ESG/Green), WritableTag boolean, TagType (NTAG213/424), WritePassword (optional).
* Buttons: Save, Preview NDEF URI, Write Tag (mobile/desktop).
* Validation: price > 0, stock >= 0, SKU unique.

## NFC Writer Panel

* Steps: 1) Select tag (single/multi), 2) Confirm payload preview, 3) Write (NDEFWriter), 4) Verify read, 5) Lock (optional) — show success TX-like confirmation.
* UX: Big CTA, progress bar, helpful microcopy: “Bring your device close to the tag and press ‘Write’.”
* Safety: if Web NFC unsupported show QR/desktop helper and a “Write via merchant app” fallback.

## Sales Feed

* Live list: timestamp, token id (link), buyer wallet (partial), product summary, amount KRW, status (pending/confirmed), anchorTxHash (if anchored).
* Filters: date range, SKU, status.
* Row actions: view receipt (modal), refund (simulate / mark), export single receipt PDF.

## Payouts & Vault

* Show available balance, vault balance, last anchor batch (txHash), scheduled payouts (next date), history.
* Button: Request Payout → open modal: choose payout rail (wallet/bank partner) or schedule.

## Reports / Export

* UI to select date range & tax class; generate CSV / PDF per invoice / batch export.
* One-click download and automatic email send.

## Alerts & Toasts

* Low stock, NFC write error, tx failed, export ready. Use consistent glass toast.

---

# UX flows (detailed)

## A — Inventory adjustment (fast)

1. Owner clicks product row → inline stock number turns into input.
2. Enters new stock or +/- amount → submit.
3. Frontend updates optimistically and shows loader.
4. Backend returns confirmation or rollback with error toast.
5. If conflict (concurrent sale reduced stock below 0) server returns `409 CONFLICT` with new stock; UI shows conflict modal: “Conflict: stock already changed to 3. Apply new value?” Options: Apply server value / Retry adjustment / Cancel.

## B — Write Tag (single)

1. From Product Edit or quick action, click **Write Tag**.
2. Show payload preview (NDEF URI) and explain what will be written: `https://taplink.app/scan?p=SKU123&b=BATCH42&c=CID&sig=...`.
3. Choose mode: `sealed (read-only)` or `writable` (password + expiry). If sealed, warn irreversible.
4. Click **Start Write** → call `POST /api/nfc/write` to reserve write nonce and get `writeToken`.
5. If `NDEFWriter` available: perform write, verify read-back, then call `POST /api/nfc/verifyWrite` with tag UID and nonce.
6. If locked: call `POST /api/nfc/lock` with password (NTAG424 flow simulated).
7. Success: show animated “Tag written” card with UID, preview, and a “Scan to verify” button.

Edge: if write fails mid-stream, allow retry with same nonce up to 3 times, then revoke nonce.

## C — Sale reconciliation & inventory decrement

1. Payment flows: user pay triggers call `POST /api/confirmPayment`.
2. Server enqueues inventory decrement transaction and returns optimistic response `updatedStock`.
3. Frontend receives websocket `sale.confirmed` event with final stock and sale record; reconcile UI.
4. If server fails to decrement (e.g., sold out), the payment is rolled back; UI displays reversal / refund route.

## D — Export tax-ready report

1. Owner selects date range & tax class → click Export.
2. System generates CSV and PDF; backend returns `jobId`.
3. Frontend polls `/api/export/status?jobId=...` and shows notification when ready.
4. Owner downloads or has file emailed.

---

# API contract (shop owner & inventory endpoints — sample payloads)

Use JSON REST + websockets:

### `GET /api/merchant/:merchantId/summary`

Response:

```json
{
  "todayRevenueKRW": 630000,
  "txCount": 12,
  "pendingPayoutsKRW": 100000,
  "lowStockCount": 2,
  "vaultBalance": 350000
}
```

### `GET /api/merchant/:merchantId/inventory`

Response:

```json
[
  {
    "productID":"SKU123",
    "name":"TapLink Tee (Black)",
    "priceKRW":25000,
    "stock":13,
    "batchID":"BATCH42",
    "writableTag": true,
    "tagType":"NTAG215",
    "image":"https://cdn.example.com/sku123.jpg"
  },
  ...
]
```

### `POST /api/inventory/:productID/update`

Request:

```json
{ "delta": -1, "reason":"sale", "note":"Order #ORD-908" }
```

Response:

```json
{ "ok": true, "productID":"SKU123", "stock":12 }
```

### `POST /api/nfc/write`

Request:

```json
{ "productID":"SKU123", "tagMode":"writable", "password":"p@ss", "expiry":"2026-01-01" }
```

Response:

```json
{ "ok": true, "writeToken":"nonce-abc-123", "payload":"https://taplink.app/scan?p=SKU123&b=BATCH42&c=CIDxyz&s=SIG" }
```

### `POST /api/nfc/verifyWrite`

Request:

```json
{ "writeToken":"nonce-abc-123", "tagUid":"04A1B2C3" }
```

Response:

```json
{ "ok": true, "locked": false, "uid":"04A1B2C3" }
```

### `GET /api/sales?merchantId=M123&from=...&to=...`

Response: list of sale objects including `receiptCID` and `txHash`.

### `POST /api/export`

Request:

```json
{ "merchantId":"M123", "from":"2025-08-01", "to":"2025-08-31", "format":"pdf", "taxClass":"vat" }
```

Response:

```json
{ "ok": true, "jobId":"export-8142" }
```

---

# Real-time system & consistency

* Use websocket (or server-sent events) `ws://` for `sale.created`, `sale.confirmed`, `inventory.updated`, `export.ready`.
* Use optimistic UI updates for inventory adjustments and sales; final state confirmed via `sale.confirmed` event.
* Implement idempotency keys for write and payment endpoints to avoid double writes.

---

# Security & permissions

* Merchant keys (private) are stored server-side in secure vault (do not ship to frontend). For demo, use ephemeral demo keys.
* NFC write nonce: server issues time-limited tokens to prevent replay.
* Role-based access: only `merchant-admin` can write/lock tags or export. `merchant-operator` can edit stock but not view merchant private key.
* Validate signature of sticker pointers server-side before showing sensitive data.

---

# Error handling & edge cases

* NFC unsupported device: show QR fallback; show instructions for iOS users.
* Tag already locked: show locked state and required reset flow (merchant must use key).
* Concurrent sales cause stock mismatch: show conflict modal with options (apply server value / hold / notify buyer).
* Export job failure: show clear error + retry button with logs.
* Network offline: queue inventory edits locally and sync on reconnect (with conflict resolution).

---

# Accessibility & localization

* Keyboard accessible table rows, buttons with aria labels.
* All pages localized EN + KO (i18n keys supplied).
* Provide screen reader support for NFC flows: fallback copy for visually impaired users: “Scan QR code for product details.”
* High-contrast mode toggle.

---

# Mock data for demo (seed)

Provide these seeds in MSW / dev DB:

* Merchants: `M123 (Cafe Seoul)`, `M234 (K-Beauty Pop)`, `M345 (Seoul Pop-Up)`.
* 20 products: variety of prices and stock counts (0, 2, 5, 20, 50).
* Sales: 3 recent confirmed sales per merchant, with sample `receiptCID` and `txHash`.
* Exports: two sample CSV & PDF downloads created for demonstration.

---

# UI microcopy (concise & tone)

* Buttons: “Save”, “Write Tag”, “Lock Tag (irreversible)”, “Export CSV/PDF”, “Request Payout”.
* Tooltips: “Writable tag: can be updated by merchant app”, “Sealed: read-only, cannot be changed”.
* Confirmation dialogs: “Lock Tag? This action is irreversible.” + two buttons: “Lock” + “Cancel”.

---

# Animations & micro-interactions

* Write success: animated checkmark + minimal particle halo in `--accent-cyan` (800ms).
* Stock decrement: row briefly pulses and shows `-1` micro-feedback.
* Export ready: Slide-in drawer from right listing downloadable files.
* Conflict modal: shake animation of conflicting row (200ms) to highlight.

---

# Acceptance Criteria (must pass)

1. Inventory table supports inline edit; updates reflect both optimistic UI and server confirmation.
2. NFC write panel can request write token, simulate NFC write (or perform actual NDEFWriter on capable devices), verify UID, and optionally lock.
3. Sales feed receives websocket updates and shows anchor tx hash when available.
4. Export job can be run across date ranges and returns download link.
5. Payouts page displays vault balance and allows scheduling a payout (simulate).
6. No UI crashes if network disconnects; queued edits retry on reconnect.
7. All flows are responsive and meet pixel specs from Figma tokens.
8. Accessibility: keyboard nav + contrast pass.

---

# Testing checklist

* Unit tests for inventory reducer logic (stock adjustments, conflict handling).
* Integration test for write flow: request write token -> simulate `NDEFWriter` -> verify `verifyWrite`.
* E2E (Cypress): simulate full sale: read tag (simulate payload) -> confirmPayment -> sale feed updates -> inventory decremented.
* Accessibility tests with axe-core.

---

# Deliverables to hand to Sonnet 4

1. Figma screens for **Owner Dashboard, Inventory List, Product Edit, NFC Writer, Sales Feed, Payouts**.
2. Storybook with components and visual tests.
3. Mock backend (MSW) with endpoints above and seeded data.
4. Cypress E2E test scripts for core flows.
5. A short README describing env variables and how to toggle mock vs real backend.

---

# Quick copy-paste brief for Sonnet 4

> Build the **Shop Owner UI** for TapLink dePOS per the attached design tokens (dark cinematic theme). Implement Inventory CRUD with optimistic updates and server reconciliation, NFC write/lock flow (simulate NTAG behavior with MSW), Sales Feed with realtime websocket events, Payouts & Export reports, and Mapbox location. Deliver Figma + Storybook + MSW seed + Cypress E2E tests. Follow the API contracts and acceptance criteria above.

---

If you want, I’ll now:

* generate the **MSW mock handlers + seed JSON** for these endpoints (ready to plug into the frontend),
* or output the **Figma-ready component spec** for the Inventory table and NFC Writer page (with exact spacing, token usage, and microcopy).

Say **“generate MSW seed”** or **“generate Figma product spec”** and I’ll produce it immediately.
