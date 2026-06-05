/**
 * 관리자 비밀번호 scrypt 해시 생성
 * 사용: node scripts/hash-admin-password.mjs "your-password"
 * 출력값을 Vercel ADMIN_PASSWORD_HASH에 설정
 */
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-admin-password.mjs <password>");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
const stored = `scrypt:${salt.toString("base64url")}:${hash.toString("base64url")}`;
console.log(stored);
