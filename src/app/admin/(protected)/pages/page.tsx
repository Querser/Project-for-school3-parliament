import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { Input } from "@/components/shared/input";
import { Textarea } from "@/components/shared/textarea";
import { STATIC_PAGE_KEYS } from "@/lib/constants";
import { requireSectionAccess } from "@/lib/auth/session";
import { getStaticPageByKey } from "@/features/pages/service";

import { updateStaticPageAction } from "./actions";

type PageConfig = {
  key: string;
  sectionTitle: string;
  defaultTitle: string;
  defaultContent: string;
};

const pageConfigs: PageConfig[] = [
  {
    key: STATIC_PAGE_KEYS.about,
    sectionTitle: "Страница «О парламенте»",
    defaultTitle: "О парламенте",
    defaultContent:
      "Ученический парламент — официальная структура ученического самоуправления, представляющая интересы учащихся и реализующая инициативы по улучшению школьной жизни.",
  },
  {
    key: STATIC_PAGE_KEYS.suggestIdea,
    sectionTitle: "Страница «Предложить идею»",
    defaultTitle: "Предложить идею",
    defaultContent:
      "Опишите вашу идею через форму на сайте или отправьте ее через Telegram. Укажите проблему, предлагаемое решение и ожидаемый результат.",
  },
  {
    key: STATIC_PAGE_KEYS.join,
    sectionTitle: "Страница «Вступить в парламент»",
    defaultTitle: "Вступить в парламент",
    defaultContent:
      "Расскажите, как проходит набор в парламент, какие роли доступны и как подать заявку на участие.",
  },
  {
    key: STATIC_PAGE_KEYS.contact,
    sectionTitle: "Страница «Контакты»",
    defaultTitle: "Контакты",
    defaultContent:
      "Укажите основные контакты парламента, правила обратной связи и официальный Telegram-канал.",
  },
  {
    key: STATIC_PAGE_KEYS.privacyPolicy,
    sectionTitle: "Страница «Политика конфиденциальности»",
    defaultTitle: "Политика конфиденциальности",
    defaultContent:
      "На сайте обрабатываются персональные данные, указанные в форме инициатив, исключительно для рассмотрения обращений и обратной связи с заявителем.",
  },
];

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await requireSectionAccess("pages");

  const { error, success } = await searchParams;

  const pages = await Promise.all(
    pageConfigs.map((config) =>
      getStaticPageByKey(config.key)
        .then((page) => ({ key: config.key, page }))
        .catch(() => ({ key: config.key, page: null })),
    ),
  );

  const pagesMap = new Map(pages.map((item) => [item.key, item.page]));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Статические страницы"
        description="Редактирование контента публичных разделов портала."
      />

      <ActionMessage error={error} success={success} />

      {pageConfigs.map((config) => {
        const page = pagesMap.get(config.key);

        return (
          <Card key={config.key}>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">{config.sectionTitle}</h2>
            <form action={updateStaticPageAction} className="space-y-3">
              <input type="hidden" name="key" value={config.key} />

              <label className="block space-y-1 text-sm">
                <span className="font-medium text-slate-700">Заголовок</span>
                <Input name="title" defaultValue={page?.title ?? config.defaultTitle} required />
              </label>

              <label className="block space-y-1 text-sm">
                <span className="font-medium text-slate-700">Содержимое</span>
                <Textarea
                  name="content"
                  defaultValue={page?.content ?? config.defaultContent}
                  required
                  className="min-h-40"
                />
              </label>

              <Button type="submit">Сохранить страницу</Button>
            </form>
          </Card>
        );
      })}
    </div>
  );
}
