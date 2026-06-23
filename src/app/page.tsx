import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/tickets");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 dark:bg-black">
      <h1 className="text-3xl font-semibold">KTG Ticket System</h1>
      <div className="flex gap-4">
        <Link href="/login" className="rounded-full bg-foreground px-5 py-3 text-background">
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="rounded-full border border-black/10 px-5 py-3 dark:border-white/15"
        >
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
