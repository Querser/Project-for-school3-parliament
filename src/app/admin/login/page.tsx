"use client";

import { type FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/shared/button";

const inputClassName =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200";

function resolveLoginErrorMessage(errorCode?: string | null) {
  if (!errorCode) {
    return "Сервис авторизации временно недоступен. Повторите попытку позже.";
  }

  if (errorCode === "CredentialsSignin") {
    return "Неверный логин или пароль";
  }

  if (errorCode === "AccessDenied") {
    return "Вход для этой учетной записи ограничен";
  }

  return "Сервис авторизации временно недоступен. Повторите попытку позже.";
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (!result) {
        setError("Сервис авторизации временно недоступен. Повторите попытку позже.");
        return;
      }

      if (result.error) {
        setError(resolveLoginErrorMessage(result.error));
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Сервис авторизации временно недоступен. Повторите попытку позже.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-md items-center px-4 py-10">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Вход в админ-панель</h1>
        <p className="mt-1 text-sm text-slate-600">
          Используйте учетные данные администратора для управления контентом.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Логин</span>
            <input className={inputClassName} name="username" required autoComplete="username" />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Пароль</span>
            <input
              className={inputClassName}
              type="password"
              name="password"
              required
              autoComplete="current-password"
            />
          </label>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Проверка..." : "Войти"}
          </Button>
        </form>
      </div>
    </main>
  );
}
