"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Credenciales inválidas");
      return;
    }

    router.push("/tickets");
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-black/10 px-3 py-2 dark:border-white/15"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-black/10 px-3 py-2 dark:border-white/15"
          required
        />
        <button type="submit" className="rounded-full bg-foreground px-5 py-3 text-background">
          Entrar
        </button>
      </form>
    </div>
  );
}
