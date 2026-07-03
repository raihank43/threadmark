// Runnable check for the core converter (network-dependent, hits live FxTwitter).
// Run: node scripts/check.ts
import assert from "node:assert";
import { convert, parseStatusId } from "../src/lib/threadmark.ts";

assert.equal(parseStatusId("https://x.com/jack/status/20"), "20");
assert.equal(parseStatusId("https://twitter.com/jack/status/20?s=46&t=x"), "20");
assert.equal(parseStatusId("https://x.com/i/status/20/photo/1"), "20");
assert.throws(() => parseStatusId("https://x.com/jack"));

// Single post
const single = await convert("https://x.com/jack/status/20");
assert.match(single.markdown, /^---\nauthor: "@jack"/);
assert.match(single.markdown, /just setting up my twttr/);
assert.match(single.markdown, /# Post by @jack/);
assert.equal(single.filename, "jack-20.md");

// Thread (naval, "How to Get Rich" — stable, multi-tweet)
const thread = await convert("https://x.com/naval/status/1002103360646823936");
assert.match(thread.markdown, /# Thread by @naval/);
assert.match(thread.markdown, /tweets: (\d+)/);
assert.ok(Number(/tweets: (\d+)/.exec(thread.markdown)![1]) > 5, "thread should have >5 tweets");

// Replies
const replied = await convert("https://x.com/jack/status/20", { replyLimit: 5 });
assert.match(replied.markdown, /## Replies/);
assert.ok((replied.markdown.match(/^\*\*@/gm) ?? []).length === 5, "should include exactly 5 replies");

console.log("all checks passed");
console.log("--- sample (thread, first 40 lines) ---");
console.log(thread.markdown.split("\n").slice(0, 40).join("\n"));
