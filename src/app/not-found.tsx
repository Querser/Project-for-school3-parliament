import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">Страница не найдена</h1>
      <p className="mt-2 text-slate-600">Проверьте адрес страницы или перейдите на главную.</p>
      <Link href="/" className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        На главную
      </Link>
    </main>
  );
}
