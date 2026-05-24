import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const eventPath = process.env.GITHUB_EVENT_PATH;

if (!eventPath) {
  throw new Error("GITHUB_EVENT_PATH is not set.");
}

const event = JSON.parse(await readFile(eventPath, "utf8"));
const issue = event.issue;

if (!issue) {
  throw new Error("This workflow must be triggered by an issue event.");
}

const fields = parseIssueForm(issue.body || "");
const title = requireField(fields, "标题");
const category = normalizeCategory(requireField(fields, "分类"));
const date = normalizeDate(fields["发布日期"]) || todayInShanghai();
const slug = normalizeSlug(fields["自定义链接名"]) || normalizeSlug(title);
const tags = normalizeTags(fields["标签"]);
const excerpt = (fields["摘要"] || "").trim();
const sourcePath = normalizeSourcePath(fields["原文章路径"]);
const body = requireField(fields, "正文");

const outputDir = path.join(process.cwd(), "_posts");
const outputPath = sourcePath
  ? path.join(process.cwd(), sourcePath)
  : path.join(outputDir, `${date}-${slug}-${issue.number}.md`);
const outputFile = path.basename(outputPath);

await mkdir(outputDir, { recursive: true });
await removePreviousPostForIssue(outputDir, issue.number, outputPath);
await writeFile(outputPath, buildPost({ title, category, date, tags, excerpt, body }), "utf8");

console.log(`POST_PATH=${outputPath}`);
console.log(`POST_FILE=${outputFile}`);

function parseIssueForm(markdown) {
  const result = {};
  const heading = /^###\s+(.+?)\s*$/gm;
  const matches = [...markdown.matchAll(heading)];

  for (let i = 0; i < matches.length; i += 1) {
    const key = matches[i][1].trim();
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length;
    let value = markdown.slice(start, end).trim();

    if (value === "_No response_") {
      value = "";
    }

    result[key] = value;
  }

  return result;
}

function requireField(fields, name) {
  const value = (fields[name] || "").trim();

  if (!value) {
    throw new Error(`Missing required field: ${name}`);
  }

  return value;
}

function normalizeCategory(value) {
  const category = value.trim().toLowerCase();
  const allowed = new Set(["article", "note", "other"]);

  if (!allowed.has(category)) {
    throw new Error(`Unsupported category: ${value}`);
  }

  return category;
}

function normalizeDate(value = "") {
  const date = value.trim();

  if (!date) {
    return "";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date: ${value}. Expected YYYY-MM-DD.`);
  }

  return date;
}

function todayInShanghai() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}

function normalizeTags(value = "") {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeSourcePath(value = "") {
  const postPath = value.trim().replace(/\\/g, "/");

  if (!postPath) {
    return "";
  }

  if (!/^_posts\/[^/]+\.md$/.test(postPath)) {
    throw new Error(`Invalid source post path: ${value}`);
  }

  return postPath;
}

function normalizeSlug(value) {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "post";
}

function buildPost({ title, category, date, tags, excerpt, body }) {
  const frontMatter = [
    "---",
    "layout: post",
    `title: ${quoteYaml(title)}`,
    `categories: ${quoteYaml(category)}`,
    tags.length ? `tags: [${tags.map(quoteYaml).join(", ")}]` : "",
    `date: ${quoteYaml(date)}`,
    `source_issue: ${issue.number}`,
    excerpt ? `excerpt: ${quoteYaml(excerpt)}` : "",
    "---",
  ].filter(Boolean);

  return `${frontMatter.join("\n")}\n\n${body.trim()}\n`;
}

async function removePreviousPostForIssue(outputDir, issueNumber, nextPath) {
  const entries = await readdir(outputDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }

    const postPath = path.join(outputDir, entry.name);

    if (postPath === nextPath) {
      continue;
    }

    const post = await readFile(postPath, "utf8");

    if (post.includes(`source_issue: ${issueNumber}`)) {
      await unlink(postPath);
    }
  }
}

function quoteYaml(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
