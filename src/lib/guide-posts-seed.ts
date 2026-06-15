/** 배터리 가이드 초기 seed — store 최초 생성 시 사용 */

import { BATTERY_GUIDE_POSTS } from "@/data/battery-guide-posts";

export type GuidePostSeedItem = {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  bodyHtml: string;
  tags: string[];
  thumbnail?: string;
  visible: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

function plainTextToBodyHtml(text: string): string {
  return text
    .split("\n\n")
    .filter(Boolean)
    .map((para) => `<p>${para.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("");
}

export const GUIDE_POSTS_SEED: GuidePostSeedItem[] = BATTERY_GUIDE_POSTS.map((post, i) => ({
  id: post.id,
  slug: post.id,
  category: post.category,
  title: post.title,
  summary: post.summary,
  bodyHtml: plainTextToBodyHtml(post.content),
  tags: post.tags,
  thumbnail: post.thumbnail,
  visible: post.isPublished,
  featured: false,
  sortOrder: i,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
}));
