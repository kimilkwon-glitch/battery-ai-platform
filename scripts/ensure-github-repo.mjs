#!/usr/bin/env node
/**
 * GitHub repo 생성(없을 때) — GITHUB_TOKEN 환경변수 필요
 * Usage: GITHUB_TOKEN=... node scripts/ensure-github-repo.mjs
 */
const REPO = "battery-ai-platform";
const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("GITHUB_TOKEN required");
  process.exit(1);
}

const res = await fetch(`https://api.github.com/repos/kimilkwon-glitch/${REPO}`, {
  headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
});
if (res.status === 200) {
  console.log(`Repo exists: kimilkwon-glitch/${REPO}`);
  process.exit(0);
}
if (res.status !== 404) {
  console.error("Check failed:", res.status, await res.text());
  process.exit(1);
}

const create = await fetch("https://api.github.com/user/repos", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name: REPO, private: false, auto_init: false }),
});
if (!create.ok) {
  console.error("Create failed:", create.status, await create.text());
  process.exit(1);
}
const data = await create.json();
console.log(`Created: ${data.html_url}`);
