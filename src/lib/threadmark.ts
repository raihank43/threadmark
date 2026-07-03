// threadmark core: X URL → FxTwitter v2 JSON → LLM-ready Markdown.
// Framework-agnostic — the web API route and the future MCP server both call convert().

const API = "https://api.fxtwitter.com/2";

export interface ConvertOptions {
  /** Max replies to include; 0/undefined = none. Follows cursors until reached. */
  replyLimit?: number;
  /** "embed" = ![alt](url); "link" = [Image: alt](url). Default "embed". */
  imageMode?: "embed" | "link";
}

export interface ConvertResult {
  markdown: string;
  filename: string;
}

// Narrow views of the FxTwitter v2 payload — only the fields we consume.
interface Author {
  screen_name: string;
  name: string;
}

interface Photo {
  url: string;
  altText?: string;
}

interface Video {
  url: string;
  thumbnail_url?: string;
}

interface Poll {
  choices: { label: string; count: number; percentage: number }[];
  total_votes: number;
}

interface Status {
  id: string;
  url: string;
  text: string;
  author: Author;
  created_at: string;
  likes: number;
  reposts: number;
  replies: number;
  views: number | null;
  media?: { photos?: Photo[]; videos?: Video[] };
  quote?: Status; // tombstone variant lacks text/author — guarded at render
  poll?: Poll;
}

interface ThreadResponse {
  code: number;
  message?: string;
  status: Status;
  thread: Status[] | null;
  replies?: Status[] | null;
  cursor?: string | null;
}

export function parseStatusId(input: string): string {
  const m = /status(?:es)?\/(\d+)/.exec(input) ?? /^(\d+)$/.exec(input.trim());
  if (!m) throw new Error(`Not an X/Twitter status URL: ${input}`);
  return m[1];
}

async function getJson(path: string): Promise<ThreadResponse> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`FxTwitter ${res.status} for ${path}`);
  const data = (await res.json()) as ThreadResponse;
  if (data.code !== 200) throw new Error(`FxTwitter error ${data.code}: ${data.message ?? "unknown"} for ${path}`);
  return data;
}

async function fetchReplies(id: string, limit: number): Promise<Status[]> {
  const out: Status[] = [];
  let cursor: string | null | undefined;
  while (out.length < limit) {
    const page = await getJson(`/conversation/${id}${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`);
    const batch = page.replies ?? [];
    out.push(...batch);
    cursor = page.cursor;
    if (!cursor || batch.length === 0) break;
  }
  return out.slice(0, limit);
}

const yamlStr = (s: string) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const isoDate = (s: string) => new Date(s).toISOString().slice(0, 10);

function renderMedia(status: Status, mode: ConvertOptions["imageMode"], indent = ""): string[] {
  const lines: string[] = [];
  for (const p of status.media?.photos ?? []) {
    const alt = p.altText ?? "image";
    lines.push(indent + (mode === "link" ? `[Image: ${alt}](${p.url})` : `![${alt}](${p.url})`));
  }
  for (const v of status.media?.videos ?? []) {
    lines.push(indent + `[Video](${v.url})`);
  }
  return lines;
}

function renderPoll(poll: Poll): string[] {
  const lines = [`**Poll** (${poll.total_votes} votes):`];
  for (const c of poll.choices) lines.push(`- ${c.label} — ${c.percentage}% (${c.count})`);
  return lines;
}

function renderStatusBody(s: Status, opts: ConvertOptions): string {
  const parts: string[] = [];
  if (s.text) parts.push(s.text);
  const media = renderMedia(s, opts.imageMode);
  if (media.length) parts.push(media.join("\n"));
  if (s.poll) parts.push(renderPoll(s.poll).join("\n"));
  if (s.quote?.author) {
    const q = s.quote;
    const qLines = [`**Quoted @${q.author.screen_name} (${q.author.name}):** ${q.text}`, ...renderMedia(q, "link")];
    parts.push(qLines.map((l) => `> ${l}`).join("\n>\n"));
  }
  return parts.join("\n\n");
}

export async function convert(url: string, opts: ConvertOptions = {}): Promise<ConvertResult> {
  const id = parseStatusId(url);
  const data = await getJson(`/thread/${id}`);
  const head = data.status;
  const posts = data.thread?.length ? data.thread : [head];
  const replies = opts.replyLimit ? await fetchReplies(id, opts.replyLimit) : [];

  const fm = [
    "---",
    `author: ${yamlStr("@" + head.author.screen_name)}`,
    `name: ${yamlStr(head.author.name)}`,
    `date: ${isoDate(head.created_at)}`,
    `url: ${head.url}`,
    `tweets: ${posts.length}`,
    `likes: ${head.likes}`,
    `reposts: ${head.reposts}`,
    `replies: ${head.replies}`,
    ...(head.views != null ? [`views: ${head.views}`] : []),
    `fetched: ${new Date().toISOString().slice(0, 10)}`,
    "---",
  ];

  const title = `# ${posts.length > 1 ? "Thread" : "Post"} by @${head.author.screen_name}`;
  const body = posts.map((p) => renderStatusBody(p, opts)).join("\n\n---\n\n");

  const sections = [fm.join("\n"), title, body];
  if (replies.length) {
    const replyLines = replies.map((r) => `**@${r.author.screen_name}** (${r.author.name}): ${renderStatusBody(r, { ...opts, imageMode: "link" })}`);
    sections.push(`## Replies`, replyLines.join("\n\n"));
  }

  return {
    markdown: sections.join("\n\n") + "\n",
    filename: `${head.author.screen_name}-${head.id}.md`,
  };
}
