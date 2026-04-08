import { SectionTitle } from "@/components/public/section-title";
import { Card } from "@/components/shared/card";
import { STATIC_PAGE_KEYS } from "@/lib/constants";
import { getStaticPageByKey } from "@/features/pages/service";

export default async function AboutPage() {
  const aboutPage = await getStaticPageByKey(STATIC_PAGE_KEYS.about).catch(() => null);

  const title = aboutPage?.title ?? "О школьном парламенте";
  const content =
    aboutPage?.content ??
    "Ученический парламент — это официальный орган ученического самоуправления, направленный на развитие школьной среды и представление интересов учащихся.";

  return (
    <div className="space-y-6">
      <SectionTitle title={title} />
      <Card>
        <article className="leading-relaxed whitespace-pre-line text-slate-700">{content}</article>
      </Card>
    </div>
  );
}
