"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailStatus() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    token ? "pending" : "error"
  );

  useEffect(() => {
    if (!token) return;

    fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then((res) => setStatus(res.ok ? "success" : "error"));
  }, [token]);

  return (
    <div className="flex max-w-sm flex-col items-center gap-4 text-center">
      {status === "pending" && <p>Verificando tu email...</p>}
      {status === "success" && (
        <>
          <p>Tu email fue verificado correctamente.</p>
          <Link href="/login" className="rounded-full bg-foreground px-5 py-2 text-background">
            Iniciar sesión
          </Link>
        </>
      )}
      {status === "error" && <p className="text-red-600">Token inválido o expirado.</p>}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Suspense>
        <VerifyEmailStatus />
      </Suspense>
    </div>
  );
}
