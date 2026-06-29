"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold">Recuperar contraseña</h1>
        {sent ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Si el email existe, te enviamos un enlace para restablecer tu contraseña.
          </p>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-black/10 px-3 py-2 dark:border-white/15"
              required
            />
            <button type="submit" className="rounded-full bg-foreground px-5 py-3 text-background">
              Enviar enlace
            </button>
          </>
        )}
      </form>
    </div>
  );
}
