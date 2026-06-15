/**
 * 배터리 가이드 저장소 파사드 — DATABASE_URL 시 Postgres, dev만 JSON fallback
 */

import path from "node:path";
import {
  assertOperationalStoreAvailable,
  isOperationalDbMode,
} from "@/lib/db/operational-store-config";

export type {
  GuidePostRecord,
  GuidePostInput,
} from "@/lib/guide-posts-store.postgres";

export { GuideBodyEmptyError } from "@/lib/guide-posts-store.postgres";

async function getStore() {
  assertOperationalStoreAvailable("guide_posts");
  if (isOperationalDbMode()) return import("@/lib/guide-posts-store.postgres");
  return import("@/lib/guide-posts-store.json");
}

export async function listAllGuidePosts() {
  return (await getStore()).listAllGuidePosts();
}

export async function listPublishedGuidePosts(
  category?: import("@/data/battery-guide-posts").GuidePostCategory,
) {
  return (await getStore()).listPublishedGuidePosts(category);
}

export async function getGuidePostById(id: string) {
  return (await getStore()).getGuidePostById(id);
}

export async function getGuidePostBySlug(slug: string) {
  return (await getStore()).getGuidePostBySlug(slug);
}

export async function createGuidePost(
  input: import("@/lib/guide-posts-store.postgres").GuidePostInput,
) {
  return (await getStore()).createGuidePost(input);
}

export async function updateGuidePost(
  id: string,
  patch: Partial<import("@/lib/guide-posts-store.postgres").GuidePostInput>,
) {
  return (await getStore()).updateGuidePost(id, patch);
}

export async function softDeleteGuidePost(id: string) {
  return (await getStore()).softDeleteGuidePost(id);
}

export const GUIDE_POSTS_STORE_PATH = isOperationalDbMode()
  ? null
  : path.join(process.cwd(), ".data", "guide-posts.json");
