import Link from "next/link";
import { auth } from "@/lib/auth";
import { NotificationBell } from "@/components/notification-bell";

export async function Nav() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <nav className="flex items-center gap-4 border-b border-black/10 px-6 py-3 text-sm dark:border-white/15">
      <Link href="/tickets" className="font-medium">
        KTG
      </Link>
      <Link href="/tickets" className="text-zinc-500 hover:text-foreground">
        Tickets
      </Link>
      {session.user.role === "ADMIN" && (
        <Link href="/admin/users" className="text-zinc-500 hover:text-foreground">
          Usuarios
        </Link>
      )}
      <div className="ml-auto">
        <NotificationBell />
      </div>
    </nav>
  );
}
