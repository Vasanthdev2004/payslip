# Kred

**Verifiable proof-of-income for onchain freelancers — built on [Arc](https://www.arc.io/), Circle's stablecoin-native L1, powered by Arc Transaction Memos.**

**Live: [kred.today](https://kred.today)**

Freelancers paid in USDC/EURC have no payslip — nothing a bank, landlord, or visa
officer will accept. Kred turns your Arc payment history into a **verifiable,
selectively-shareable proof of income**: a statement where every line is backed by an
on-chain tx hash, and a public verify link a third party can confirm against Arc
**without trusting your word**.

> The chain is always the source of truth for amounts. Our database stores only tags
> and disclosure preferences — never the numbers.

## Why Arc Transaction Memos

An Arc payment settles instantly but arrives as a bare transfer. Arc's **Memo contract**
lets a payer attach structured context (invoice, project, period) to a payment — and,
because it routes through the `CALL_FROM` precompile, the payment still emits a normal
ERC-20 `Transfer` from the **real payer** plus a `Memo` event in the **same transaction**.
Kred reads both (F1) and writes them (F3). See [`docs/arc-notes.md`](docs/arc-notes.md).

## Features

| | Feature | Status |
|---|---|---|
| F1 | Connect + index incoming USDC/EURC on Arc | ✅ |
| F2 | Decode memos + manual tagging | ✅ |
| F3 | **Pay-with-memo** request/payer flow (the showcase) | ✅ |
| F4 | Income statement + charts + branded PDF | ✅ |
| F5 | Public verify page + selective disclosure (trustless recompute) | ✅ |
| F6 | **KredRegistry** — on-chain tamper-evident anchor for disclosures | ✅ built (activates when the contract address is set) |
| F7 | Polished, responsive, dark/light UI (WebGL fluid hero, glass design system) | ✅ |

All correctness-critical paths went through adversarial multi-agent review passes
before this status was claimed — see [`PROGRESS.md`](PROGRESS.md).

## How the trust model works

1. **Income** is read from Arc (explorer index + RPC receipts) — never entered by hand.
2. **A disclosure** stores only *which* tx hashes + *which* fields to reveal.
3. **The verify page recomputes** every amount live from Arc receipts. Tampering with
   the database cannot change a verified number — the DB never held it.
4. **(F6, optional)** The owner can anchor a keccak256 digest of the disclosure in the
   `KredRegistry` contract from their own wallet. The verify page recomputes the digest
   and reads `anchoredAt(owner, digest)` **from the contract** — so "Anchored on-chain ·
   date" can't be faked either. No amounts or PII ever go on-chain.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · shadcn/Radix · wagmi + viem ·
RainbowKit · Recharts · @react-pdf/renderer · Prisma + PostgreSQL · Solidity
(`contracts/KredRegistry.sol`) · deployed on Railway.

## Getting started

```bash
npm install
cp .env.example .env           # .env (not .env.local) — Prisma's CLI only reads .env
# set DATABASE_URL to any Postgres you control, then:
npx prisma migrate deploy
npm run dev                    # http://localhost:3000
```

Connect a wallet, switch to **Arc Testnet** when prompted, and fund it from the
[Circle faucet](https://faucet.circle.com).

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres for tags + disclosure prefs (never amounts) |
| `NEXT_PUBLIC_WC_PROJECT_ID` | no | WalletConnect project id — without it only injected wallets (e.g. MetaMask extension) connect; set it to enable mobile/WalletConnect wallets |
| `NEXT_PUBLIC_APP_URL` | no | Absolute origin for OG/share metadata (defaults to `https://kred.today`) |
| `NEXT_PUBLIC_KRED_REGISTRY_ADDRESS` | no | Deployed `KredRegistry` address — the anchor button + badge stay dormant until set |
| `DEPLOYER_PRIVATE_KEY` | no | Only for `npm run deploy:registry`; never committed |

### Deploying the KredRegistry contract (F6)

```bash
# fund a wallet at https://faucet.circle.com, put its key in .env as DEPLOYER_PRIVATE_KEY
npm run deploy:registry        # compiles with solc + deploys via viem, prints the address
# then set NEXT_PUBLIC_KRED_REGISTRY_ADDRESS to that address (locally + in prod) and redeploy
```

### Arc testnet at a glance

| | |
|---|---|
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | `https://testnet.arcscan.app` |
| USDC (ERC-20) | `0x3600…0000` (6 dp; **native** USDC events are emitted by `0xff…fe` in 18 dp) |
| EURC | `0x89B5…D72a` (6 dp) |
| Memo contract | `0x5294…E505` |
| Multicall3 | `0xcA11…CA11` (client reads are batched — the public RPC rate-limits rapid separate calls) |

Full, verified reference: [`docs/arc-notes.md`](docs/arc-notes.md). Progress log:
[`PROGRESS.md`](PROGRESS.md).

## Known limitations (testnet MVP)

Surfaced by adversarial review passes; the correctness bugs are fixed, these are the
deliberate scope calls:

- **Arc testnet only** — test USDC/EURC, not real funds. A production launch means Arc
  mainnet, a dedicated RPC endpoint, and a security review.
- **No wallet authentication on the tags API.** Tags (private categorization metadata)
  trust the `address` param (IDOR); the proper fix is Sign-In-with-Ethereum. The
  **chain-derived data (income, verify) needs no auth** — it's public + recomputed.
  The anchor-tx PATCH, by contrast, *is* verified on-chain before being stored.
- **Verify links are unauthenticated + not globally rate-limited.** Amplification is
  bounded per link (≤500 disclosed txs + short ISR caching on `/verify`).
- **History indexes the most recent ~6,000 transfers** (memo enrichment: most recent
  ~250). Truncation is surfaced in the UI rather than silently dropped.

## License

MIT.
