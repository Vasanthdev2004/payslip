# Progress

Running log of milestones. Chain is the source of truth; DB is metadata only.

## Status

- [x] **M0 — Ground truth + scaffold** ✅
  - [x] Verified Arc facts → [`docs/arc-notes.md`](docs/arc-notes.md)
  - [x] Next.js 14 + TS + Tailwind + wagmi/viem/RainbowKit scaffold
  - [x] Arc testnet chain configured in [`config/arc.ts`](config/arc.ts)
  - [x] Memo adapter interface + verified ABI in [`lib/memo/`](lib/memo)
  - [x] `npm run build` green; dev server renders landing + connect, console clean
- [x] **M1 — Connect + index incoming USDC/EURC (F1)** ✅
  - Explorer `tokentx` API for history (RPC `eth_getLogs` is capped to a 10k range
    over ~52M blocks — infeasible to scan), memo enrichment via RPC tx receipts.
  - Server route `/api/income` → `useIncome` hook → summary tiles + memo-aware table.
  - Verified against a real Arc recipient (6k transfers parsed; totals from all,
    table capped to 100 rows). Chain stays the source of truth.
- [x] **M2 — Memo adapter decode + tagging (F2)** ✅
  - SQLite migration (Tag/Disclosure) + `/api/tags` CRUD (upsert keyed by
    address+txHash), `useTags`/`useSetTag` hooks.
  - Feed merges manual tags with on-chain memos (effective memo); untagged rows get
    a Tag action + dialog; categorized % counts both. DB is metadata-only.
  - Verified: tags CRUD round-trip + tsc clean.
- [x] **M3 — Pay-with-memo request/payer flow (F3)** ✅ ← Memo showcase
  - Stateless request links (`/pay?…`, no backend record) → payer page renders the
    memo + sends USDC via `Memo.memo(...)` (write path, no approve needed).
  - Request builder (`/request`) with live payer-card preview + copyable link.
  - Verified: calldata round-trip (memo wraps transfer + carries JSON), pages render,
    tsc clean. Live signature needs a funded wallet.
- [x] **M4 — Income Statement + charts + PDF (F4)** ✅
  - Pure aggregation (totals as bigint = exact on-chain sums; by-client/category;
    monthly trend). Recharts trend chart with dataviz-validated CVD-safe colors
    (green USDC / blue EURC, both light+dark).
  - Branded PDF via @react-pdf/renderer (dynamic-imported) with full tx hashes per
    row for independent verification. Verified: render + PDF smoke test + tsc clean.
  - `/statement` page + dashboard action.
- [x] **M5 — Public verify + selective disclosure (F5)** ✅
  - `/verify/[id]` server-recomputes totals from chain by tx hash (never trusts DB);
    handles Arc's native-USDC Transfer (`0xffff…fffe`, 18dp → 6dp) + ERC-20 EURC.
  - Disclosure builder (`/share`): pick period + which fields to reveal; total +
    backing txs always shown (that's what makes it verifiable).
  - Verified end-to-end against a real Arc address: recomputed totals render, an
    unverifiable tx is honestly excluded, bogus id 404s, tsc clean.
- [x] **M6 (stretch) — KredRegistry anchor (F6)** ✅ (built; deploy = one command)
  - Minimal `KredRegistry.sol`: `anchor(bytes32 digest)` → `anchoredAt[msg.sender][digest]`
    = `block.timestamp` (idempotent, keyed by sender; no amounts/PII ever on-chain).
  - Server-computed disclosure digest (returned at create, recomputed at `/verify`) so the
    anchored value and the verify check can't drift; owner anchors from their wallet on `/share`.
  - `/verify` reads the anchor from the **contract** (never the DB) → "Anchored on-chain · date · tx".
  - Dormant until `NEXT_PUBLIC_KRED_REGISTRY_ADDRESS` is set; deploy via
    `npm run deploy:registry` (solc compile + viem deploy to Arc).
- [~] **M7 — deploy ✅ (Railway) · polish/demo remaining**
  - Live: https://kred.today
  - Railway project `kred` + managed Postgres (persistent volume); Prisma on
    postgresql; `migrate deploy` pre-deploy; local dev shares the same DB.
  - Verified live: all routes 200 + a real disclosure→verify recompute round-trip
    against Arc from the production server.
  - Since then: kred.today domain + OG/Twitter share cards; site-wide glass design
    system + MonthPicker; real @web3icons coins + Jazzicon avatar; Multicall3 balance
    fix; README launch pass (71 claims adversarially fact-checked).
  - Remaining: WC project id (mobile wallets), KredRegistry activation (owner deploys
    + sets NEXT_PUBLIC_KRED_REGISTRY_ADDRESS), live wallet demo run, demo recording.

## Adversarial review pass (pre-deploy)

Multi-agent review (5 dimensions → adversarial verify). 9 raw findings; acted on them
after checking each against reality:
- **Rejected (false positive):** "native USDC income dropped" — the explorer's `tokentx`
  normalizes native USDC to the 0x3600/6dp view, verified live (`/api/income` returns
  correct USDC); the suggested fix would have *broken* working code.
- **Fixed:** memo discriminator (reject foreign/other-version memos); PDF row date in UTC;
  breakdown ranking no longer sums USDC+EURC 1:1; `/verify` guards non-array txHashes +
  ISR caching + 500-tx cap (DoS); memo enrichment cap 150→250; history truncation now
  surfaced in the UI.
- **Deferred (documented in README):** tags IDOR (needs SIWE auth); global rate-limiting.

## Key decisions

- **Memo mechanism:** memo'd payments route through Arc's Memo contract
  (`0x5294..E505`) → inner `transfer` via `CALL_FROM` precompile preserves the payer as
  `msg.sender`. So `Transfer` + `Memo` events land in the **same tx**; we join on tx hash.
- **No approve needed** for pay-with-memo (CALL_FROM makes the payer the direct sender).
- **Selective disclosure** discloses backing tx hashes for the verified view (trustless
  recompute), rather than Arc's not-yet-live confidential-tx feature.
