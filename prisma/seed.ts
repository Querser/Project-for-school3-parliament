import {
  PrismaClient,
  MemberRoleType,
  NewsStatus,
  PublicationStatus,
  EventStatus,
  InitiativePriority,
  InitiativeStatus,
  AdminRole,
  AccountStatus,
  AppLogGroup,
  AuditAction,
  LogSeverity,
  SecurityEventType,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

const storageRoot = path.resolve(process.cwd(), process.env.STORAGE_ROOT ?? "storage");

async function ensureTextFile(relativePath: string, content: string) {
  const absolutePath = path.join(storageRoot, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content, "utf8");

  const stat = await fs.stat(absolutePath);
  return {
    relativePath: relativePath.replaceAll("\\", "/"),
    size: stat.size,
  };
}

async function ensureSvg(relativePath: string, title: string, subtitle: string) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">\n  <defs>\n    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">\n      <stop offset="0%" stop-color="#0f172a"/>\n      <stop offset="100%" stop-color="#334155"/>\n    </linearGradient>\n  </defs>\n  <rect width="1200" height="800" fill="url(#g)"/>\n  <text x="80" y="360" fill="#ffffff" font-size="62" font-family="Arial">${title}</text>\n  <text x="80" y="430" fill="#cbd5e1" font-size="34" font-family="Arial">${subtitle}</text>\n</svg>`;

  return ensureTextFile(relativePath, svg);
}

async function cleanupData() {
  await prisma.initiativeNote.deleteMany({});
  await prisma.initiative.deleteMany({});
  await prisma.galleryItem.deleteMany({});
  await prisma.galleryAlbum.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.newsOnTag.deleteMany({});
  await prisma.newsTag.deleteMany({});
  await prisma.newsCategory.deleteMany({});
  await prisma.news.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.ministry.deleteMany({});
  await prisma.homeBlock.deleteMany({});
  await prisma.staticPage.deleteMany({});
  await prisma.appLog.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.securityEvent.deleteMany({});
  await prisma.telemetryEvent.deleteMany({});
  await prisma.adminSession.deleteMany({});
}

async function main() {
  const seedAccounts = [
    {
      username: process.env.ADMIN_SEED_USERNAME ?? "admin",
      password: process.env.ADMIN_SEED_PASSWORD ?? "admin12345",
      role: AdminRole.CHIEF_ADMIN,
      email: "admin@school.local",
    },
    {
      username: process.env.PRESIDENT_SEED_USERNAME ?? "president",
      password: process.env.PRESIDENT_SEED_PASSWORD ?? "president12345",
      role: AdminRole.ADMIN,
      email: "president@school.local",
    },
    {
      username: process.env.MINISTER_SEED_USERNAME ?? "minister",
      password: process.env.MINISTER_SEED_PASSWORD ?? "minister12345",
      role: AdminRole.MINISTRY_EDITOR,
      email: "minister@school.local",
    },
  ] as const;

  const hashedPasswords = await Promise.all(seedAccounts.map((account) => bcrypt.hash(account.password, 12)));

  const seededUsers = [] as Array<{ id: string; username: string }>;
  for (let index = 0; index < seedAccounts.length; index += 1) {
    const account = seedAccounts[index];
    const passwordHash = hashedPasswords[index];

    const user = await prisma.adminUser.upsert({
      where: { username: account.username },
      update: {
        email: account.email,
        passwordHash,
        role: account.role,
        status: AccountStatus.ACTIVE,
        lastLoginAt: null,
      },
      create: {
        username: account.username,
        email: account.email,
        passwordHash,
        role: account.role,
        status: AccountStatus.ACTIVE,
      },
      select: {
        id: true,
        username: true,
      },
    });

    seededUsers.push(user);
  }

  const chiefAdmin = seededUsers.find((user) => user.username === seedAccounts[0].username);
  if (!chiefAdmin) {
    throw new Error("Не удалось подготовить учетную запись администратора");
  }

  await cleanupData();

  await prisma.adminUser.deleteMany({
    where: {
      username: {
        notIn: seedAccounts.map((account) => account.username),
      },
    },
  });

  const ministriesSeed = [
    {
      name: "Министерство культуры",
      slug: "ministerstvo-kultury",
      description:
        "Организация школьных культурных мероприятий, творческих проектов и поддержка традиций школьного сообщества.",
      displayOrder: 1,
    },
    {
      name: "Министерство социальных проектов",
      slug: "ministerstvo-socialnyh-proektov",
      description:
        "Разработка и реализация инициатив, улучшающих школьную среду, поддержку учеников и развитие добровольческих практик.",
      displayOrder: 2,
    },
    {
      name: "МВД (Министерство внутренних дел)",
      slug: "mvd-ministerstvo-vnutrennih-del",
      description:
        "Координация внутреннего порядка, организационной дисциплины и взаимодействия при проведении парламентских мероприятий.",
      displayOrder: 3,
    },
    {
      name: "Министерство науки и образования",
      slug: "ministerstvo-nauki-i-obrazovaniya",
      description:
        "Поддержка образовательных и научных инициатив, повышение учебной мотивации и развитие проектной деятельности.",
      displayOrder: 4,
    },
  ];

  const ministries = new Map<string, { id: string }>();
  for (const ministry of ministriesSeed) {
    const saved = await prisma.ministry.create({
      data: {
        name: ministry.name,
        slug: ministry.slug,
        shortDescription: ministry.description,
        fullDescription: ministry.description,
        workDirections: ministry.description,
        initiativeHighlight: null,
        displayOrder: ministry.displayOrder,
      },
      select: { id: true },
    });
    ministries.set(ministry.slug, saved);
  }

  const membersSeed = [
    {
      fullName: "Алиса Борис",
      slug: "alisa-boris",
      roleType: MemberRoleType.PRESIDENT,
      positionTitle: "Президент ученического парламента",
      shortBio: "Координирует работу парламента и представляет инициативы учащихся.",
      ministrySlug: null,
      displayOrder: 1,
    },
    {
      fullName: "Разуванов Кирилл",
      slug: "razuvanov-kirill",
      roleType: MemberRoleType.VICE_PRESIDENT,
      positionTitle: "Вице-президент ученического парламента",
      shortBio: "Курирует взаимодействие министерств и сопровождение парламентских проектов.",
      ministrySlug: null,
      displayOrder: 2,
    },
    {
      fullName: "Мазуров Егор",
      slug: "mazurov-egor",
      roleType: MemberRoleType.MINISTER,
      positionTitle: "Министр социальных проектов",
      shortBio: "Руководит социальными инициативами и проектами школьного сообщества.",
      ministrySlug: "ministerstvo-socialnyh-proektov",
      displayOrder: 3,
    },
  ];

  const members = new Map<string, { id: string }>();
  for (const member of membersSeed) {
    const memberMinistryId = member.ministrySlug ? ministries.get(member.ministrySlug)?.id ?? null : null;

    const saved = await prisma.member.create({
      data: {
        fullName: member.fullName,
        slug: member.slug,
        roleType: member.roleType,
        positionTitle: member.positionTitle,
        shortBio: member.shortBio,
        activeTerm: "2025–2026",
        duties: member.shortBio,
        displayOrder: member.displayOrder,
        ministries: memberMinistryId
          ? {
              connect: [{ id: memberMinistryId }],
            }
          : undefined,
      },
      select: { id: true },
    });
    members.set(member.slug, saved);
  }

  await prisma.ministry.update({
    where: { slug: "ministerstvo-socialnyh-proektov" },
    data: { ministerMemberId: members.get("mazurov-egor")?.id ?? null },
  });

  const categoryAnnouncements = await prisma.newsCategory.create({
    data: { name: "Объявления", slug: "obyavleniya" },
  });
  const categoryProjects = await prisma.newsCategory.create({
    data: { name: "Проекты", slug: "proekty" },
  });

  const tagEvents = await prisma.newsTag.create({ data: { name: "мероприятия", slug: "meropriyatiya" } });
  const tagInitiatives = await prisma.newsTag.create({ data: { name: "инициативы", slug: "initsiativy" } });

  const springForum = await prisma.event.create({
    data: {
      title: "Весенний форум ученических инициатив",
      slug: "vesenniy-forum-uchenicheskih-initsiativ",
      description:
        "Открытый форум с презентацией школьных инициатив, обсуждением проектов и формированием плана реализации.",
      category: "Форум",
      organizer: "Ученический парламент",
      location: "Актовый зал",
      startAt: new Date("2026-04-25T10:00:00.000Z"),
      endAt: new Date("2026-04-25T13:00:00.000Z"),
      status: EventStatus.PLANNED,
      ministryId: ministries.get("ministerstvo-socialnyh-proektov")?.id,
      createdById: chiefAdmin.id,
    },
  });

  const volunteerDay = await prisma.event.create({
    data: {
      title: "День добровольца",
      slug: "den-dobrovoltsa",
      description: "Школьная акция взаимопомощи и полезных социальных практик.",
      category: "Акция",
      organizer: "Министерство социальных проектов",
      location: "Территория школы",
      startAt: new Date("2026-03-10T08:30:00.000Z"),
      endAt: new Date("2026-03-10T12:00:00.000Z"),
      status: EventStatus.COMPLETED,
      ministryId: ministries.get("ministerstvo-socialnyh-proektov")?.id,
      createdById: chiefAdmin.id,
    },
  });

  const newsSeed = [
    {
      title: "Сформирован план работы ученического парламента на четверть",
      slug: "plan-raboty-parlamenta-na-chetvert",
      summary: "Утверждены ключевые инициативы, сроки и ответственные по направлениям работы.",
      content:
        "На заседании ученического парламента утвержден план работы на текущую четверть. В фокусе — развитие ученических инициатив, улучшение коммуникации между классами и проведение тематических мероприятий.",
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date("2026-02-15T09:00:00.000Z"),
      categoryId: categoryAnnouncements.id,
      ministryId: ministries.get("ministerstvo-socialnyh-proektov")?.id,
      eventId: null,
      tagIds: [tagInitiatives.id],
    },
    {
      title: "Открыт сбор предложений по улучшению школьной среды",
      slug: "sbor-predlozheniy-po-uluchsheniyu-shkolnoy-sredy",
      summary: "Каждый ученик может предложить инициативу через сайт или Telegram-канал парламента.",
      content:
        "Парламент приглашает всех учащихся направлять предложения по улучшению школьной среды. Приоритет отдается инициативам, которые можно реализовать в течение учебного года.",
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date("2026-03-03T10:30:00.000Z"),
      categoryId: categoryProjects.id,
      ministryId: ministries.get("ministerstvo-socialnyh-proektov")?.id,
      eventId: volunteerDay.id,
      tagIds: [tagInitiatives.id, tagEvents.id],
    },
    {
      title: "Анонс весеннего форума ученических инициатив",
      slug: "anons-vesennego-foruma-uchenicheskih-initsiativ",
      summary: "Форум объединит авторов школьных проектов, министров и депутатов парламента.",
      content:
        "25 апреля пройдет весенний форум ученических инициатив. Команды представят идеи, получат обратную связь и сформируют дорожные карты реализации.",
      status: NewsStatus.SCHEDULED,
      publishedAt: null,
      categoryId: categoryAnnouncements.id,
      ministryId: ministries.get("ministerstvo-socialnyh-proektov")?.id,
      eventId: springForum.id,
      tagIds: [tagEvents.id],
    },
  ];

  for (const item of newsSeed) {
    const created = await prisma.news.create({
      data: {
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content: item.content,
        status: item.status,
        scheduledAt: item.status === NewsStatus.SCHEDULED ? new Date("2026-04-22T07:00:00.000Z") : null,
        publishedAt: item.publishedAt,
        categoryId: item.categoryId,
        ministryId: item.ministryId,
        eventId: item.eventId,
        authorId: chiefAdmin.id,
      },
    });

    await prisma.newsOnTag.createMany({
      data: item.tagIds.map((tagId) => ({ newsId: created.id, tagId })),
      skipDuplicates: true,
    });
  }

  const constitutionDoc = await ensureTextFile(
    "uploads/documents/constitution.docx",
    [
      "КОНСТИТУЦИЯ УЧЕНИЧЕСКОГО ПАРЛАМЕНТА",
      "",
      "1. Ученический парламент является официальным органом ученического самоуправления.",
      "2. Основная цель парламента — представление интересов учащихся и развитие школьной среды.",
      "3. Парламент действует на принципах открытости, ответственности и сотрудничества.",
    ].join("\n"),
  );

  const regulationDoc = await ensureTextFile(
    "uploads/documents/regulations.docx",
    [
      "РЕГЛАМЕНТ ЗАСЕДАНИЙ УЧЕНИЧЕСКОГО ПАРЛАМЕНТА",
      "",
      "1. Заседания проводятся не реже одного раза в месяц.",
      "2. Повестка формируется заранее и публикуется для участников.",
      "3. Решения принимаются большинством голосов присутствующих членов парламента.",
    ].join("\n"),
  );

  await prisma.document.createMany({
    data: [
      {
        title: "Конституция ученического парламента",
        description: "Базовый документ о принципах и структуре работы парламента.",
        category: "Конституция",
        version: "1.0",
        filePath: constitutionDoc.relativePath,
        originalFileName: "constitution.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileSize: constitutionDoc.size,
        status: PublicationStatus.PUBLISHED,
        publishedAt: new Date("2026-01-20T09:00:00.000Z"),
      },
      {
        title: "Регламент заседаний",
        description: "Порядок проведения заседаний и принятия решений.",
        category: "Регламент",
        version: "1.1",
        filePath: regulationDoc.relativePath,
        originalFileName: "regulations.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileSize: regulationDoc.size,
        status: PublicationStatus.PUBLISHED,
        publishedAt: new Date("2026-02-01T09:00:00.000Z"),
      },
    ],
  });

  const reportFile = await ensureTextFile(
    "uploads/reports/report-march-2026.txt",
    [
      "Отчет министерства социальных проектов за март 2026",
      "",
      "Проведено 4 инициативы, из них 3 завершены и 1 находится в реализации.",
      "Участие приняли 126 учащихся.",
    ].join("\n"),
  );

  await prisma.report.create({
    data: {
      title: "Отчет министерства социальных проектов",
      slug: "otchet-ministerstva-socialnyh-proektov-mart-2026",
      periodLabel: "Март 2026",
      summary: "Итоги социальных инициатив за март: реализованные проекты и вовлеченность учащихся.",
      content:
        "В марте реализованы инициативы по взаимопомощи в учебе, благоустройству и наставничеству. Подготовлен план масштабирования успешных практик.",
      status: PublicationStatus.PUBLISHED,
      publishedAt: new Date("2026-04-01T09:30:00.000Z"),
      ministryId: ministries.get("ministerstvo-socialnyh-proektov")?.id,
      filePath: reportFile.relativePath,
      originalFileName: "report-march-2026.txt",
      mimeType: "text/plain",
      fileSize: reportFile.size,
      createdById: chiefAdmin.id,
    },
  });

  await prisma.achievement.createMany({
    data: [
      {
        title: "Запуск школьного клуба взаимопомощи",
        slug: "zapusk-shkolnogo-kluba-vzaimopomoshchi",
        summary: "Создана устойчивая система поддержки учеников по учебным вопросам.",
        content:
          "Инициатива объединяет учеников-тьюторов и участников, которым нужна помощь в подготовке к контрольным и проектам.",
        impact: "Еженедельно участвуют более 40 учеников.",
        status: PublicationStatus.PUBLISHED,
        publishedAt: new Date("2026-03-28T10:00:00.000Z"),
        ministryId: ministries.get("ministerstvo-socialnyh-proektov")?.id,
        eventId: volunteerDay.id,
        createdById: chiefAdmin.id,
      },
      {
        title: "Серия культурных школьных вечеров",
        slug: "seriya-kulturnyh-shkolnyh-vecherov",
        summary: "Развитие школьных традиций и межклассного взаимодействия.",
        content:
          "Министерство культуры запустило цикл тематических вечеров, где классы представляют проекты и творческие номера.",
        impact: "Увеличено участие учеников в внеурочной деятельности.",
        status: PublicationStatus.PUBLISHED,
        publishedAt: new Date("2026-02-25T12:00:00.000Z"),
        ministryId: ministries.get("ministerstvo-kultury")?.id,
        createdById: chiefAdmin.id,
      },
    ],
  });

  const galleryCover = await ensureSvg(
    "uploads/gallery/spring-forum-cover.svg",
    "Весенний форум инициатив",
    "Ученический парламент МОУ СОШ №3",
  );

  const galleryItem = await ensureSvg(
    "uploads/gallery/spring-forum-stage.svg",
    "Презентации проектов",
    "Команды представляют инициативы",
  );

  const album = await prisma.galleryAlbum.create({
    data: {
      title: "Весенний форум инициатив 2026",
      slug: "vesenniy-forum-initsiativ-2026",
      description: "Фотоальбом ключевых моментов форума ученических инициатив.",
      coverImagePath: galleryCover.relativePath,
      status: PublicationStatus.PUBLISHED,
      publishedAt: new Date("2026-04-25T15:00:00.000Z"),
      eventId: springForum.id,
      createdById: chiefAdmin.id,
    },
  });

  await prisma.galleryItem.create({
    data: {
      albumId: album.id,
      mediaPath: galleryItem.relativePath,
      mediaType: "image/svg+xml",
      caption: "Защита инициативных проектов школьных команд.",
      sortOrder: 1,
    },
  });

  const initiativeOne = await prisma.initiative.create({
    data: {
      title: "Зона тихого чтения в библиотеке",
      description:
        "Предложение создать выделенную зону для самостоятельной подготовки и чтения с удобным расписанием доступа.",
      submitterName: "Анонимно",
      isAnonymous: true,
      status: InitiativeStatus.UNDER_REVIEW,
      priority: InitiativePriority.HIGH,
      assignedMinistryId: ministries.get("ministerstvo-nauki-i-obrazovaniya")?.id,
      assignedAdminId: chiefAdmin.id,
      publicShowcase: false,
    },
  });

  const initiativeTwo = await prisma.initiative.create({
    data: {
      title: "Единый школьный день волонтерства",
      description:
        "Ежемесячная акция, где классы участвуют в общественно полезных проектах внутри школы и города.",
      submitterName: "Совет 9А класса",
      submitterContact: "9a@school.local",
      isAnonymous: false,
      status: InitiativeStatus.IMPLEMENTED,
      priority: InitiativePriority.MEDIUM,
      assignedMinistryId: ministries.get("ministerstvo-socialnyh-proektov")?.id,
      assignedAdminId: chiefAdmin.id,
      publicShowcase: true,
      implementedAt: new Date("2026-03-10T13:00:00.000Z"),
    },
  });

  await prisma.initiativeNote.createMany({
    data: [
      {
        initiativeId: initiativeOne.id,
        authorId: chiefAdmin.id,
        note: "Передано на оценку реализуемости министерству науки и образования.",
        isStatusChange: true,
        fromStatus: InitiativeStatus.NEW,
        toStatus: InitiativeStatus.UNDER_REVIEW,
      },
      {
        initiativeId: initiativeTwo.id,
        authorId: chiefAdmin.id,
        note: "Инициатива реализована и переведена в публичную витрину достижений.",
        isStatusChange: true,
        fromStatus: InitiativeStatus.IN_PROGRESS,
        toStatus: InitiativeStatus.IMPLEMENTED,
      },
    ],
  });

  await prisma.staticPage.createMany({
    data: [
      {
        key: "about",
        title: "О парламенте",
        content:
          "Ученический парламент МОУ СОШ №3 г. Можайска — официальная структура ученического самоуправления, представляющая интересы учащихся и реализующая инициативы по улучшению школьной жизни. Основные роли в структуре парламента: президент, вице-президент, депутаты и министры.",
      },
      {
        key: "suggest_idea",
        title: "Предложить идею",
        content:
          "Вы можете направить идею через форму на сайте или через Telegram. Опишите проблему, решение, ожидаемый результат и ориентировочные шаги внедрения.",
      },
      {
        key: "join",
        title: "Вступить в парламент",
        content:
          "Для вступления в парламент подготовьте короткую мотивационную заявку и обратитесь к куратору ученического самоуправления. Набор открыт для активных учащихся 7–11 классов.",
      },
      {
        key: "contact",
        title: "Контакты",
        content:
          "Связаться с ученическим парламентом можно через официальный Telegram. Адрес: Московская область, г. Можайск, улица Полосухина, 3А.",
      },
      {
        key: "privacy_policy",
        title: "Политика конфиденциальности",
        content:
          "На сайте ученического парламента обрабатываются только данные, необходимые для рассмотрения инициатив и обратной связи. Через форму инициатив могут собираться ФИО, класс, контакт, текст обращения и вложения; также фиксируются технические данные запроса для безопасности. Эти сведения используются для обработки инициативы, уточнения деталей и ответа заявителю. Доступ к данным имеют только уполномоченные представители парламента и администраторы сайта в рамках своих обязанностей. Контактные данные, включая Telegram, используются исключительно для коммуникации по обращению. Пользователь вправе запросить уточнение и актуализацию переданных данных через официальные контакты школы и парламента.",
      },
    ],
  });

  await prisma.homeBlock.createMany({
    data: [
      {
        key: "hero_primary",
        title: "Участвуй в развитии школьной жизни",
        description: "Присоединяйся к инициативам парламента и предлагай свои идеи для школы.",
        ctaLabel: "Предложить идею",
        ctaHref: "/initiatives",
        displayOrder: 1,
        isEnabled: true,
      },
      {
        key: "home_documents",
        title: "Официальные документы",
        description: "Конституция, регламенты, протоколы и отчеты в открытом доступе.",
        ctaLabel: "Открыть библиотеку",
        ctaHref: "/documents",
        displayOrder: 2,
        isEnabled: true,
      },
      {
        key: "home_join",
        title: "Стань частью команды",
        description: "Узнай, как попасть в состав парламента и участвовать в проектах.",
        ctaLabel: "Как вступить",
        ctaHref: "/join",
        displayOrder: 3,
        isEnabled: true,
      },
    ],
  });

  const settings = [
    { key: "site_name", value: "Ученический парламент МОУ СОШ №3 г. Можайска" },
    { key: "site_name_short", value: "Ученический парламент" },
    { key: "home_intro_title", value: "Официальный портал ученического парламента" },
    {
      key: "home_intro_text",
      value:
        "Мы объединяем инициативных учеников для развития школьной среды, диалога и реализации полезных проектов.",
    },
    { key: "telegram_idea_url", value: "https://t.me/alisa_boris" },
    { key: "contact_email", value: "" },
    { key: "contact_phone", value: "" },
    { key: "contact_address", value: "Московская область, г. Можайск, улица Полосухина, 3А" },
    { key: "official_telegram", value: "https://t.me/alisa_boris" },
    {
      key: "privacy_notice",
      value:
        "На сайте используются технические и аналитические данные для улучшения качества работы платформы.",
    },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  await prisma.securityEvent.createMany({
    data: [
      {
        eventType: SecurityEventType.LOGIN_SUCCESS,
        success: true,
        message: "Успешный вход главного администратора",
        adminUserId: chiefAdmin.id,
        ipAddress: "127.0.0.1",
        userAgent: "Seeder/1.0",
        requestId: "seed-login-success",
      },
      {
        eventType: SecurityEventType.LOGIN_FAILURE,
        success: false,
        message: "Неуспешная попытка входа с неверным паролем",
        usernameAttempt: "admin",
        ipAddress: "127.0.0.1",
        userAgent: "Seeder/1.0",
        requestId: "seed-login-failure",
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        action: AuditAction.CREATE,
        module: "news",
        entityType: "News",
        summary: "Создана демонстрационная публикация",
        actorUserId: chiefAdmin.id,
        requestId: "seed-audit-news",
      },
      {
        action: AuditAction.STATUS_CHANGE,
        module: "initiatives",
        entityType: "Initiative",
        summary: "Инициатива переведена в статус UNDER_REVIEW",
        actorUserId: chiefAdmin.id,
        requestId: "seed-audit-initiative",
      },
    ],
  });

  await prisma.appLog.createMany({
    data: [
      {
        group: AppLogGroup.HTTP,
        severity: LogSeverity.INFO,
        module: "public",
        message: "GET / completed",
        method: "GET",
        path: "/",
        statusCode: 200,
        latencyMs: 32,
        requestId: "seed-http-1",
      },
      {
        group: AppLogGroup.DOMAIN,
        severity: LogSeverity.INFO,
        module: "initiatives",
        message: "Initiative submitted",
        requestId: "seed-domain-1",
      },
      {
        group: AppLogGroup.SYSTEM,
        severity: LogSeverity.WARN,
        module: "jobs",
        message: "Background aggregation delayed",
        requestId: "seed-system-1",
      },
    ],
  });

  await prisma.telemetryEvent.createMany({
    data: [
      {
        category: "traffic",
        eventType: "page_view",
        path: "/",
        referrer: "direct",
        sessionId: "seed-session-1",
        visitorHash: "anon-visitor-1",
      },
      {
        category: "engagement",
        eventType: "idea_cta_click",
        path: "/suggest-idea",
        sessionId: "seed-session-2",
        visitorHash: "anon-visitor-2",
      },
      {
        category: "content",
        eventType: "document_download",
        path: "/documents",
        value: 1,
      },
    ],
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


