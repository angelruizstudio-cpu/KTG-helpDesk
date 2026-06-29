"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Error al registrarse");
      return;
    }

    setRegistered(true);
  }

  if (registered) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="max-w-sm text-center">
          Te enviamos un email de verificación. Confirma tu cuenta antes de iniciar sesión.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold">Crear cuenta</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-black/10 px-3 py-2 dark:border-white/15"
          required
        />
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
          placeholder="Contraseña (mín. 8 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-black/10 px-3 py-2 dark:border-white/15"
          required
        />
        <button type="submit" className="rounded-full bg-foreground px-5 py-3 text-background">
          Registrarse
        </button>
      </form>
    </div>
  );
}
