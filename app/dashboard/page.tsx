import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDF8F0]">
      <div className="text-center">
        <h1
          className="text-3xl font-bold text-[#1B3A2D]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Dashboard coming soon
        </h1>
        <p className="mt-4 text-[#1B3A2D]/70">
          Signed in as <strong>{user?.email}</strong>
        </p>
      </div>
    </div>
  );
}
