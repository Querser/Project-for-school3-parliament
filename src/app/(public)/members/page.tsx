import Image from "next/image";

import { SectionTitle } from "@/components/public/section-title";
import { Card, CardDescription, CardTitle } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { toPublicUploadUrl } from "@/lib/storage";
import { getMembersPublicGrouped } from "@/features/members/service";

const groupTitles = {
  president: "Президент",
  vicePresident: "Вице-президент",
  deputies: "Депутаты",
  ministers: "Министры",
} as const;

export default async function MembersPage() {
  const grouped = await getMembersPublicGrouped().catch(() => ({
    president: [],
    vicePresident: [],
    deputies: [],
    ministers: [],
  }));

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Состав ученического парламента"
        description="Команда парламента и распределение ролей в текущем составе."
      />

      {(Object.keys(groupTitles) as Array<keyof typeof groupTitles>).map((groupKey) => {
        const members = grouped[groupKey];

        return (
          <section key={groupKey} className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">{groupTitles[groupKey]}</h2>
            {members.length === 0 ? (
              <EmptyState
                title="Раздел пока пуст"
                description="Состав в этой категории ещё не заполнен."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {members.map((member) => (
                  <Card key={member.id} className="flex gap-4">
                    {member.photoPath ? (
                      <Image
                        src={toPublicUploadUrl(member.photoPath)}
                        alt={member.fullName}
                        width={88}
                        height={88}
                        className="h-22 w-22 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-22 w-22 rounded-md bg-slate-200" />
                    )}
                    <div className="space-y-1">
                      <CardTitle className="text-base">{member.fullName}</CardTitle>
                      <p className="text-sm font-medium text-slate-700">{member.positionTitle}</p>
                      <CardDescription>{member.shortBio}</CardDescription>
                      {member.ministries.length > 0 ? (
                        <p className="text-xs text-slate-500">
                          Министерства: {member.ministries.map((ministry) => ministry.name).join(", ")}
                        </p>
                      ) : null}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
