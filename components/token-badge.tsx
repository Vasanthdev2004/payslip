import { cn } from "@/lib/utils";
import type { TokenSymbol } from "@/lib/tokens";
import { TokenLogo } from "./token-logo";

/** Small token coin. Real brand-style logo (see TokenLogo). */
export function TokenBadge({
  symbol,
  size = "md",
  className,
}: {
  symbol: TokenSymbol;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <TokenLogo
      symbol={symbol}
      className={cn(size === "sm" ? "size-5" : "size-8", className)}
    />
  );
}
