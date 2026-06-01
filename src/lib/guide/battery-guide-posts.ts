import {
  BATTERY_GUIDE_POSTS,
  GUIDE_POST_CATEGORY_META,
  type GuidePost,
  type GuidePostCategory,
} from "@/data/battery-guide-posts";

export function listPublishedGuidePosts(category?: GuidePostCategory): GuidePost[] {
  return BATTERY_GUIDE_POSTS.filter(
    (p) => p.isPublished && (!category || p.category === category),
  ).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getGuidePostById(id: string): GuidePost | undefined {
  return BATTERY_GUIDE_POSTS.find((p) => p.id === id && p.isPublished);
}

export function listGuidePostTags(category: GuidePostCategory): string[] {
  const tags = new Set<string>();
  for (const p of listPublishedGuidePosts(category)) {
    for (const t of p.tags) tags.add(t);
  }
  return [...tags].sort();
}

export { GUIDE_POST_CATEGORY_META };
