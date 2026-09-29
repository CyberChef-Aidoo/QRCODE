import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.screenshot({ path: "fold-375.png", fullPage: false });

const data = await page.evaluate(() => {
  const vh = window.innerHeight;
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      height: Math.round(r.height),
      width: Math.round(r.width),
      bg: s.backgroundColor,
      color: s.color,
      fontSize: s.fontSize,
    };
  };
  const links = [...document.querySelectorAll("a.channel-link")].map((el) => ({
    text: el.textContent.replace(/\s+/g, " ").trim(),
    href: el.getAttribute("href"),
    ...box(el),
  }));
  const order = [...document.querySelectorAll("main h1, main h2, main .channel-stack, main .quiz, main .resources, main .about")]
    .map((el) => el.tagName + " " + (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 48));
  return {
    vh,
    scrollY: window.scrollY,
    overflowX: document.documentElement.scrollWidth > 375,
    stripe: box(document.querySelector(".masthead")),
    logo: box(document.querySelector(".brand-logo")),
    org: document.querySelector(".org-name")?.textContent,
    h1: document.querySelector("h1")?.textContent,
    lead: document.querySelector(".lead")?.textContent,
    confirm: [...document.querySelectorAll(".confirm-line")].map((el) => el.textContent),
    captions: [...document.querySelectorAll(".channel-caption")].map((el) => el.textContent),
    links,
    bigLogo: Boolean(document.querySelector(".logo")),
    choose: document.body.innerText.includes("Choose a channel"),
    order,
  };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
