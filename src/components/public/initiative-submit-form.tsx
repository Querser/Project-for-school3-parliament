"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { submitInitiativeAction } from "@/app/(public)/initiatives/actions";
import {
  INITIAL_INITIATIVE_FORM_STATE,
  type InitiativeFormFieldErrors,
} from "@/components/public/initiative-form-state";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Textarea } from "@/components/shared/textarea";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-700">{message}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Отправка..." : "Отправить инициативу"}
    </Button>
  );
}

export function InitiativeSubmitForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(submitInitiativeAction, INITIAL_INITIATIVE_FORM_STATE);
  const fieldErrors: InitiativeFormFieldErrors | undefined = state.fieldErrors;

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="mt-4 space-y-4">
      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          }
        >
          {state.message}
        </p>
      ) : null}

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-slate-700">Тема инициативы</span>
        <Input name="title" aria-invalid={Boolean(fieldErrors?.title)} required />
        <FieldError message={fieldErrors?.title} />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-slate-700">Описание</span>
        <Textarea
          name="description"
          className="min-h-32"
          aria-invalid={Boolean(fieldErrors?.description)}
          required
        />
        <FieldError message={fieldErrors?.description} />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-slate-700">Класс</span>
        <Input
          name="submitterClass"
          placeholder="Например: 9А"
          aria-invalid={Boolean(fieldErrors?.submitterClass)}
          required
        />
        <FieldError message={fieldErrors?.submitterClass} />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">ФИО</span>
          <Input name="submitterName" />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Контакт</span>
          <Input name="submitterContact" placeholder="Email, Telegram" />
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-slate-700">Вложение</span>
        <Input type="file" name="attachment" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.svg" />
      </label>

      <div className="space-y-1 text-sm">
        <label className="inline-flex items-start gap-2 text-slate-700">
          <input
            type="checkbox"
            name="personalDataConsent"
            value="true"
            required
            className="mt-1 h-4 w-4 rounded border-slate-300"
            aria-invalid={Boolean(fieldErrors?.personalDataConsent)}
          />
          <span>
            Я соглашаюсь на{" "}
            <Link href="/privacy-policy" className="font-medium text-slate-900 underline underline-offset-2">
              обработку персональных данных
            </Link>
            .
          </span>
        </label>
        <FieldError message={fieldErrors?.personalDataConsent} />
      </div>

      <SubmitButton />
    </form>
  );
}
