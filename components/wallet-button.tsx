"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Our own connect button (shadcn Button) driven by RainbowKit's headless
 * ConnectButton.Custom — keeps the connect/switch/account modals, drops the
 * default green pill so it matches the app's design language.
 */
export function WalletButton({
  label = "Connect wallet",
  size = "default",
  glow = false,
  className,
}: {
  label?: string;
  size?: ButtonProps["size"];
  glow?: boolean;
  className?: string;
}) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
            })}
          >
            {!connected ? (
              <Button
                onClick={openConnectModal}
                size={size}
                className={cn(
                  glow &&
                    "bg-gradient-to-b from-brand-3 to-brand text-[#04140f] shadow-[0_16px_50px_-12px_hsl(var(--brand)/0.6)] transition-[filter,transform] hover:brightness-105 active:scale-[0.98]",
                  className,
                )}
              >
                <Wallet className="size-4" />
                {label}
              </Button>
            ) : chain.unsupported ? (
              <Button
                onClick={openChainModal}
                size={size}
                variant="destructive"
                className={className}
              >
                Wrong network
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={openChainModal}
                  size={size}
                  variant="outline"
                  className="gap-1.5"
                >
                  {chain.hasIcon && chain.iconUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={chain.name ?? "chain"}
                      src={chain.iconUrl}
                      className="size-4 rounded-full"
                    />
                  )}
                  <span className="hidden sm:inline">{chain.name}</span>
                </Button>
                <Button
                  onClick={openAccountModal}
                  size={size}
                  variant="secondary"
                  className="gap-1.5 font-mono"
                >
                  {account.displayName}
                  <ChevronDown className="size-3.5 opacity-60" />
                </Button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
