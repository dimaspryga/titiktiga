"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { RequireAuth } from "@/components/auth-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="admin" returnTo="/admin/dashboard">
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}
