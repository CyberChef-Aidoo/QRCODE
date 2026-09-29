import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 375, height: 800 } });
const problems = [];
function check(name, ok, detail = "") {
  if (!ok) problems.push(`${name}${detail ? `: ${detail}` : ""}`);
  console.log(`${ok ? "ok" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

await page.goto("http://localhost:5174/", { waitUntil: "networkidle" });
await page.screenshot({ path: "refine-375.png", fullPage: true });
await page.getByRole("radio", { name: /Increase/ }).check();
await page.getByRole("button", { name: "Check answer" }).click();
await page.locator(".quiz-card").scrollIntoViewIfNeeded();
await page.screenshot({ path: "refine-quiz.png", fullPage: false });

const text = await page.locator("body").innerText();
check("no resource heading", !text.includes("What is on this page"));
check("hero", text.includes("Make accounting make sense."));
check("shared note", text.includes("These buttons open the channel in a new tab."));
check("note once", text.split("These buttons open the channel in a new tab.").length === 2);
check("about", text.includes("About Duahbed Consult"));

const cards = page.locator("article.platform-card");
check("two cards", (await cards.count()) === 2);

const youtube = page.getByRole("link", { name: "Watch lessons on YouTube" });
const whatsapp = page.getByRole("link", { name: "Get updates on WhatsApp" });
check("youtube href", (await youtube.getAttribute("href"))?.includes("youtube.com/@duahbedconsult"));
check("whatsapp href", (await whatsapp.getAttribute("href"))?.includes("whatsapp.com/channel/0029VbCMdxhEquiS6QwyF23b"));
check("youtube new tab", (await youtube.getAttribute("target")) === "_blank");
check("whatsapp new tab", (await whatsapp.getAttribute("target")) === "_blank");

const youtubeBox = await youtube.boundingBox();
const whatsappBox = await whatsapp.boundingBox();
check("cta height", Math.round(youtubeBox.height) === 52 && Math.round(whatsappBox.height) === 52, `${youtubeBox.height} ${whatsappBox.height}`);

await youtube.focus();
const youtubeOutline = await youtube.evaluate((el) => getComputedStyle(el).outlineStyle);
check("youtube focus", youtubeOutline !== "none", youtubeOutline);

const increase = page.getByRole("radio", { name: /Increase/ });
await increase.check();
check("selected text", (await page.locator("[data-state='selected']").innerText()).includes("Selected"));
const before = await page.evaluate(() => document.activeElement?.textContent?.trim() || document.activeElement?.tagName);
await page.getByRole("button", { name: "Check answer" }).click();
const after = await page.evaluate(() => document.activeElement?.textContent?.trim() || "");
check("focus stays on check", after === "Check answer", `before ${before} after ${after}`);
check("incorrect mark", (await page.locator("[data-state='incorrect']").innerText()).includes("Incorrect"));
check("correct mark", (await page.locator("[data-state='correct']").innerText()).includes("Correct"));
const status = await page.locator("[role='status']").innerText();
check("status text", status.includes("Not this time") && status.includes("total assets stay the same"), status);

await page.getByRole("radio", { name: /Stay the same/ }).check();
check("marks cleared", (await page.locator("[data-state='correct']").count()) === 0);
await page.getByRole("button", { name: "Check answer" }).click();
check("correct result", (await page.locator("[role='status']").innerText()).includes("Yes. Total assets stay the same."));
check("only correct mark", (await page.locator("[data-state='incorrect']").count()) === 0);

const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const cardBg = await page.locator(".platform-card").first().evaluate((el) => getComputedStyle(el).backgroundColor);
const quizBg = await page.locator(".quiz-card").evaluate((el) => getComputedStyle(el).backgroundColor);
const heading = await page.locator("h1").evaluate((el) => getComputedStyle(el).color);
const body = await page.locator(".lead").evaluate((el) => getComputedStyle(el).color);
const yt = await youtube.evaluate((el) => getComputedStyle(el).backgroundColor);
check("grey page", bg === "rgb(232, 234, 237)", bg);
check("white card", cardBg === "rgb(255, 255, 255)", cardBg);
check("quiz tint", quizBg === "rgb(231, 238, 248)", quizBg);
check("navy heading", heading === "rgb(16, 4, 112)", heading);
check("slate body", body === "rgb(51, 65, 85)", body);
check("restrained red", yt === "rgb(159, 18, 57)", yt);

console.log(problems.length ? `PROBLEMS\n${problems.join("\n")}` : "ALL PASSED");
await browser.close();
process.exit(problems.length ? 1 : 0);
