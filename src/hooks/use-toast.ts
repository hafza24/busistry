// Legacy shim — re-exports a sonner-backed toast() so existing
// `useToast()` / `toast()` calls continue to work after standardizing on Sonner.
import * as React from "react";
import { toast as sonnerToast } from "sonner";

type ToastInput = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
  duration?: number;
};

function renderToast({ title, description, variant, duration }: ToastInput) {
  const message = (title as string) ?? "";
  const opts = { description: description as string | undefined, duration };
  if (variant === "destructive") return sonnerToast.error(message, opts);
  return sonnerToast(message, opts);
}

export function toast(input: ToastInput) {
  const id = renderToast(input);
  return {
    id: String(id),
    dismiss: () => sonnerToast.dismiss(id),
    update: () => {},
  };
}

export function useToast() {
  return {
    toast,
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
    toasts: [] as never[],
  };
}
