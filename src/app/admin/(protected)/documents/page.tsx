import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils/date";
import { getDocumentsAdminList } from "@/features/documents/service";

import { deleteDocumentAction } from "./actions";

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const documents = await getDocumentsAdminList().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageHeader title="Документы" description="Управление официальными документами." />
        <Link href="/admin/documents/new">
          <Button>Добавить документ</Button>
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      {documents.length === 0 ? (
        <EmptyState
          title="Документы пока не загружены"
          description="Добавьте первый документ для публикации на сайте."
          actionHref="/admin/documents/new"
          actionLabel="Загрузить документ"
        />
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{doc.title}</h3>
                <p className="text-sm text-slate-600">{doc.description}</p>
                <p className="text-xs text-slate-500">
                  {doc.category} | Публикация: {formatDate(doc.publishedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/documents/${doc.id}`}>
                  <Button variant="outline" size="sm">
                    Редактировать
                  </Button>
                </Link>
                <form action={deleteDocumentAction.bind(null, doc.id)}>
                  <Button variant="danger" size="sm" type="submit">
                    Удалить
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
