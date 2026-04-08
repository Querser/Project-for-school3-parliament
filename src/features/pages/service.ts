import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db/prisma";

const getStaticPageByKeyCached = unstable_cache(
  async (key: string) => {
    return prisma.staticPage.findUnique({ where: { key } });
  },
  ["static-page-by-key"],
  {
    tags: ["static-pages"],
    revalidate: 300,
  },
);

export async function getStaticPageByKey(key: string) {
  return getStaticPageByKeyCached(key);
}

export async function upsertStaticPage(key: string, title: string, content: string) {
  return prisma.staticPage.upsert({
    where: { key },
    update: { title, content },
    create: { key, title, content },
  });
}
