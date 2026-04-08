"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[admin-error]", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">Ошибка административного раздела</h1>
      <p className="mt-2 text-slate-600">Сервис временно недоступен. Попробуйте повторить вход или действие позже.</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Повторить
        </button>
        <Link href="/admin/login" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100">
          К входу
        </Link>
      </div>
    </main>
  );
}
