"use client";

import { useEffect } from "react";

export default function AdminProtectedErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[admin-protected-error]", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Не удалось загрузить раздел</h1>
      <p className="mt-2 text-sm text-slate-600">
        Возникла временная ошибка. Технические детали скрыты, попробуйте повторить запрос.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Повторить
      </button>
    </section>
  );
}
