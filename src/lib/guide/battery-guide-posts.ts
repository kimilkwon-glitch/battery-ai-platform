import {
  BATTERY_GUIDE_POSTS,
  GUIDE_POST_CATEGORY_META,
  type GuidePost,
  type GuidePostCategory,
} from "@/data/battery-guide-posts";
import {
  listPublishedGuidePosts as listPublishedGuidePostRecords,
  type GuidePostRecord,
} from "@/lib/guide-posts-store";

function recordToGuidePost(record: GuidePostRecord): GuidePost {
  return {
    id: record.id,
    category: record.category,
    title: record.title,
    summary: record.summary,
    content: record.bodyHtml,
    tags: record.tags,
    thumbnail: record.thumbnail,
    isPublished: record.visible,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function listPublishedGuidePosts(category?: GuidePostCategory): Promise<GuidePost[]> {
  try {
    const records = await listPublishedGuidePostRecords(category);
    if (records.length > 0) return records.map(recordToGuidePost);
  } catch {
    /* fallback */
  }
  return BATTERY_GUIDE_POSTS.filter(
    (p) => p.isPublished && (!category || p.category === category),
  ).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getGuidePostById(id: string): Promise<GuidePost | undefined> {
  try {
    const { getGuidePostById: getById, getGuidePostBySlug } = await import(
      "@/lib/guide-posts-store"
    );
    const record = (await getById(id)) ?? (await getGuidePostBySlug(id));
    if (record) return recordToGuidePost(record);
  } catch {
    /* fallback */
  }
  return BATTERY_GUIDE_POSTS.find((p) => p.id === id && p.isPublished);
}

export async function listGuidePostTags(category: GuidePostCategory): Promise<string[]> {
  const tags = new Set<string>();
  for (const p of await listPublishedGuidePosts(category)) {
    for (const t of p.tags) tags.add(t);
  }
  return [...tags].sort();
}

export { GUIDE_POST_CATEGORY_META };
