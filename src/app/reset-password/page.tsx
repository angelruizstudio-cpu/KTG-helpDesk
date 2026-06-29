"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (!res.ok) {
      setError("No se pudo restablecer la contraseña. El enlace puede haber expirado.");
      return;
    }

    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Restablecer contraseña</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        type="password"
        placeholder="Nueva contraseña (mín. 8 caracteres)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded border border-black/10 px-3 py-2 dark:border-white/15"
        required
      />
      <button type="submit" className="rounded-full bg-foreground px-5 py-3 text-background">
        Restablecer
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
