import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { formatUnits } from "viem";
import type { Statement } from "@/lib/statement";

const EMERALD = "#0f9d6b";
const INK = "#0b1220";
const MUTED = "#6b7280";
const HAIR = "#e5e7eb";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: INK, fontFamily: "Helvetica" },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { fontSize: 16, fontFamily: "Helvetica-Bold", color: INK },
  seal: { fontSize: 8, color: EMERALD, fontFamily: "Helvetica-Bold" },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", marginTop: 18 },
  sub: { fontSize: 10, color: MUTED, marginTop: 2 },
  totalsRow: { flexDirection: "row", gap: 24, marginTop: 16 },
  totalBox: { borderWidth: 1, borderColor: HAIR, borderRadius: 6, padding: 12, minWidth: 150 },
  totalLabel: { fontSize: 8, color: MUTED, textTransform: "uppercase" },
  totalValue: { fontSize: 18, fontFamily: "Helvetica-Bold", marginTop: 4 },
  section: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 22, marginBottom: 6 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: HAIR, paddingVertical: 5 },
  th: { fontSize: 8, color: MUTED, textTransform: "uppercase" },
  cellName: { flex: 3 },
  cellNum: { flex: 1, textAlign: "right" },
  txHash: { fontSize: 6.5, color: MUTED, fontFamily: "Courier", marginTop: 2 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    fontSize: 7.5,
    color: MUTED,
    borderTopWidth: 1,
    borderTopColor: HAIR,
    paddingTop: 8,
  },
});

const money = (a: bigint, d: number) =>
  Number(formatUnits(a, d)).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const FIAT: Record<string, string> = { USDC: "$", EURC: "€" };
const MAX_TX = 80;

function StatementDoc({
  statement,
  address,
  verifyUrl,
}: {
  statement: Statement;
  address: string;
  verifyUrl?: string;
}) {
  const totals = Object.entries(statement.totals);
  const txs = statement.txs.slice(0, MAX_TX);
  const hidden = statement.txs.length - txs.length;

  return (
    <Document title="Kred Income Statement">
      <Page size="A4" style={styles.page}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>Kred</Text>
          <Text style={styles.seal}>VERIFIABLE ON ARC</Text>
        </View>

        <Text style={styles.h1}>Income Statement</Text>
        <Text style={styles.sub}>
          {statement.from} to {statement.to} · wallet {address}
        </Text>

        <View style={styles.totalsRow}>
          {totals.map(([sym, t]) => (
            <View key={sym} style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total {sym}</Text>
              <Text style={styles.totalValue}>
                {FIAT[sym] ?? ""}
                {money(t.amount, t.decimals)}
              </Text>
              <Text style={{ fontSize: 8, color: MUTED, marginTop: 2 }}>
                {t.count} payment{t.count === 1 ? "" : "s"}
              </Text>
            </View>
          ))}
        </View>

        {statement.byClient.length > 0 && (
          <>
            <Text style={styles.section}>By client</Text>
            <View style={[styles.row, { borderBottomColor: INK }]}>
              <Text style={[styles.th, styles.cellName]}>Client</Text>
              <Text style={[styles.th, styles.cellNum]}>USDC</Text>
              <Text style={[styles.th, styles.cellNum]}>EURC</Text>
            </View>
            {statement.byClient.map((r) => (
              <View key={r.name} style={styles.row}>
                <Text style={styles.cellName}>{r.name}</Text>
                <Text style={styles.cellNum}>{r.USDC ? r.USDC.toFixed(2) : "—"}</Text>
                <Text style={styles.cellNum}>{r.EURC ? r.EURC.toFixed(2) : "—"}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.section}>
          Transactions {hidden > 0 ? `(showing ${MAX_TX} of ${statement.txs.length})` : ""}
        </Text>
        <View style={[styles.row, { borderBottomColor: INK }]}>
          <Text style={[styles.th, { flex: 2 }]}>Date</Text>
          <Text style={[styles.th, { flex: 3 }]}>Client</Text>
          <Text style={[styles.th, styles.cellNum]}>Amount</Text>
        </View>
        {txs.map((t, i) => (
          <View key={`${t.txHash}-${i}`} style={styles.row}>
            <View style={{ flex: 5 }}>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ flex: 2 }}>
                  {new Date(t.timestamp).toLocaleDateString("en-US", {
                    timeZone: "UTC",
                  })}
                </Text>
                <Text style={{ flex: 3 }}>{t.client ?? "—"}</Text>
              </View>
              <Text style={styles.txHash}>{t.txHash}</Text>
            </View>
            <Text style={styles.cellNum}>
              {money(t.amount, t.decimals)} {t.symbol}
            </Text>
          </View>
        ))}

        <Text style={styles.footer}>
          Every line is backed by an on-chain transaction on Arc — the tx hash under
          each row can be independently verified on the block explorer. Kred stores
          no amounts; figures are derived from chain data.
          {verifyUrl ? ` Verify online: ${verifyUrl}` : ""}
        </Text>
      </Page>
    </Document>
  );
}

/** Build the PDF client-side and trigger a download. */
export async function downloadStatementPdf(opts: {
  statement: Statement;
  address: string;
  verifyUrl?: string;
}) {
  const blob = await pdf(<StatementDoc {...opts} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kred-income-${opts.statement.from}_${opts.statement.to}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
