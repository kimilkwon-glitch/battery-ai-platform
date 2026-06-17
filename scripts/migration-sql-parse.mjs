/**
 * Production migration SQL 파싱 — 단순 세미콜론 split 금지
 * 주석 제거 후 statement 분리, CREATE TABLE → INDEX 순서 보장
 */

/** 라인 단위 -- 주석 제거 (migration SQL은 문자열 리터럴에 -- 없음) */
export function stripSqlLineComments(sql) {
  return sql
    .split(/\r?\n/)
    .map((line) => {
      const idx = line.indexOf("--");
      if (idx >= 0) return line.slice(0, idx);
      return line;
    })
    .join("\n");
}

/** 세미콜론 기준 statement 분리 (주석 strip 후) */
export function splitMigrationStatements(sql) {
  const cleaned = stripSqlLineComments(sql);
  return cleaned
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const EXECUTABLE_PREFIXES = [
  "CREATE TABLE",
  "CREATE UNIQUE INDEX",
  "CREATE INDEX",
  "ALTER TABLE",
];

export function isExecutableMigrationStatement(statement) {
  const upper = statement.toUpperCase();
  if (upper.includes("CONCURRENTLY")) return false;
  return EXECUTABLE_PREFIXES.some((prefix) => upper.startsWith(prefix));
}

/** 실행 순서: TABLE → ALTER → INDEX */
export function orderMigrationStatements(statements) {
  const rank = (statement) => {
    const upper = statement.toUpperCase().trim();
    if (upper.startsWith("CREATE TABLE")) return 0;
    if (upper.startsWith("ALTER TABLE")) return 1;
    if (upper.startsWith("CREATE UNIQUE INDEX") || upper.startsWith("CREATE INDEX")) return 2;
    return 3;
  };
  return [...statements].sort((a, b) => rank(a) - rank(b));
}

/** CREATE INDEX … ON table_name 추출 */
export function extractIndexTargetTable(statement) {
  const match = statement.match(/\bON\s+("?[\w]+"?)\s*\(/i);
  if (!match) return null;
  return match[1].replace(/"/g, "");
}

/** 파일에서 실행 대상 DDL만 순서대로 반환 (TABLE → ALTER → INDEX) */
export function parseMigrationFile(sql) {
  const filtered = splitMigrationStatements(sql).filter(isExecutableMigrationStatement);
  return orderMigrationStatements(filtered);
}

export function normalizeIndexDef(def) {
  return def.replace(/\s+/g, " ").trim().toLowerCase();
}

export function extractIndexName(statement) {
  const match = statement.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?("?[\w]+"?)/i);
  if (!match) return null;
  return match[1].replace(/"/g, "");
}

export function extractTableNameFromCreateTable(statement) {
  const match = statement.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?("?[\w]+"?)/i);
  if (!match) return null;
  return match[1].replace(/"/g, "");
}
