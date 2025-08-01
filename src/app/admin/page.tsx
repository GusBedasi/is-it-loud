"use client"

import { AdminGuard } from '@/components/auth/admin-guard';
import { SubmissionsAdmin } from '@/components/admin/submissions-admin';

export default function AdminPage() {
  return (
    <AdminGuard>
      <SubmissionsAdmin />
    </AdminGuard>
  );
}