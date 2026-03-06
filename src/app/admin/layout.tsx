import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getCurrentUser } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Panel Admina",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/logowanie");
  }

  return (
    <div className="flex min-h-screen pt-16">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8">{children}</div>
    </div>
  );
}
