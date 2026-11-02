"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  max = 99,
  disabled = false,
  testIdPrefix = "quantity",
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  disabled?: boolean;
  testIdPrefix?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Quantity"
      className={cn("inline-flex items-center border border-input", disabled && "opacity-50")}
    >
      <button
        type="button"
        aria-label="Kurangi jumlah"
        data-testid={`${testIdPrefix}-minus`}
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-accent disabled:opacity-40"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label="Jumlah"
        data-testid={`${testIdPrefix}-input`}
        value={value}
        min={1}
        max={max}
        disabled={disabled}
        onChange={(e) => {
          const next = Number.parseInt(e.target.value, 10);
          if (!Number.isNaN(next)) onChange(Math.min(Math.max(1, next), max));
        }}
        className="h-10 w-12 border-x border-input bg-transparent text-center font-mono text-sm [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Tambah jumlah"
        data-testid={`${testIdPrefix}-plus`}
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-accent disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
