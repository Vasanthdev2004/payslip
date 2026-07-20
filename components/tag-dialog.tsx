"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSetTag, type TagInput } from "@/hooks/use-tags";

const CATEGORIES = [
  "development",
  "design",
  "consulting",
  "writing",
  "marketing",
  "retainer",
  "other",
];

export interface TagDraft {
  client?: string | null;
  project?: string | null;
  category?: string | null;
  invoice?: string | null;
  period?: string | null;
  note?: string | null;
}

export function TagDialog({
  open,
  onClose,
  txHash,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  txHash: string;
  initial?: TagDraft;
}) {
  const setTag = useSetTag();
  const [form, setForm] = useState<TagDraft>({
    client: initial?.client ?? "",
    project: initial?.project ?? "",
    category: initial?.category ?? "",
    invoice: initial?.invoice ?? "",
    period: initial?.period ?? "",
    note: initial?.note ?? "",
  });

  const set =
    (k: keyof TagDraft) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: TagInput = {
      txHash,
      client: form.client || null,
      project: form.project || null,
      category: form.category || null,
      invoice: form.invoice || null,
      period: form.period || null,
      note: form.note || null,
    };
    try {
      await setTag.mutateAsync(payload);
      toast.success("Tag saved", {
        description: "Metadata only — the on-chain amount is untouched.",
      });
      onClose();
    } catch {
      toast.error("Couldn't save the tag — try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tag this payment</DialogTitle>
          <DialogDescription>
            Metadata only — this never changes the on-chain amount.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tag-client">Client</Label>
            <Input
              id="tag-client"
              value={form.client ?? ""}
              onChange={set("client")}
              placeholder="Acme Inc"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tag-project">Project</Label>
              <Input
                id="tag-project"
                value={form.project ?? ""}
                onChange={set("project")}
                placeholder="Website redesign"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category || ""}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger className="capitalize">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tag-invoice">Invoice #</Label>
              <Input
                id="tag-invoice"
                value={form.invoice ?? ""}
                onChange={set("invoice")}
                placeholder="INV-2026-014"
              />
            </div>
            <div>
              <Label htmlFor="tag-period">Period</Label>
              <Input
                id="tag-period"
                type="month"
                value={form.period ?? ""}
                onChange={set("period")}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tag-note">Note</Label>
            <Input
              id="tag-note"
              value={form.note ?? ""}
              onChange={set("note")}
              placeholder="March retainer"
            />
          </div>
          <Button type="submit" className="w-full" disabled={setTag.isPending}>
            {setTag.isPending ? "Saving…" : "Save tag"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
