"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

interface LoginFormValues {
  username: string;
  password: string;
}

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

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError("");

    try {
      const result = await signIn("credentials", {
        username: values.username,
        password: values.password,
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
    }
  });

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
            <Input {...register("username", { required: true })} autoComplete="username" />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Пароль</span>
            <Input
              type="password"
              {...register("password", { required: true })}
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
