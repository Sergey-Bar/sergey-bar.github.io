import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * The home page, tested as a product: a document a reader takes in, with
 * contents beside it and an ask bar under it. Every spec runs against the
 * built static export.
 */

const SECTIONS = [
  ["about", "About me"],
  ["experience", "Experience"],
  ["toolbox", "Toolbox"],
  ["recommendations", "Recommendations"],
  ["projects", "Projects"],
  ["cases", "Case studies"],
  ["contact", "Contact"],
  ["fun", "Something fun"],
] as const;

/**
 * The opening screen shows once per browser session. Every spec but the ones
 * about it starts as a visitor who has already seen it.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("booted", "1");
    } catch {
      /* A page without storage simply sees the screen. */
    }
  });
});

async function expectAxeClean(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
}

const heading = (page: Page, id: string) => page.locator(`#${id}-heading`);
const field = (page: Page) => page.getByRole("textbox", { name: "Ask about my work" });

async function ask(page: Page, text: string) {
  await field(page).fill(text);
  await field(page).press("Enter");
}

/** Opens the contents the way the layout offers them: beside the page, or in the drawer. */
async function contents(page: Page) {
  const menu = page.getByRole("button", { name: "Contents", exact: true });
  if (await menu.isVisible()) await menu.click();
  return page.getByRole("navigation", { name: "Contents" });
}

test.describe("the first screen", () => {
  test("is the person, the role and the ways to reach them, with nothing to wait for", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: "Sergey Bar" })).toBeInViewport();
    await expect(page.locator(".hero-role")).toHaveText("QA Tech Lead & AI Automation Engineer");
    await expect(page.getByRole("img", { name: "Sergey Bar" })).toBeInViewport();
    await expect(page.getByRole("link", { name: "Connect on LinkedIn" }).first()).toBeInViewport();
    await expect(page.getByRole("link", { name: "Request my CV", exact: true })).toHaveAttribute("href", /^mailto:.*CV/);
    // Nothing to sit through, and no job-board badge.
    await expect(page.locator(".boot")).toBeHidden();
    await expect(page.getByText("Open to work")).toHaveCount(0);
  });

  test("the page is one document: one h1, then every section as an h2, in order", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const titles = await page.getByRole("heading", { level: 2 }).allTextContents();
    expect(titles).toEqual(SECTIONS.map(([, label]) => label));
    for (const [id] of SECTIONS) await expect(page.locator(`#${id}`)).toBeVisible();
  });

  test("passes the accessibility audit", async ({ page }) => {
    await page.goto("/");
    await expectAxeClean(page);
  });

  test("has no horizontal overflow, down to 320px", async ({ page }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      for (const [id] of SECTIONS) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflow, `${id} at ${width}px`).toBe(false);
      }
    }
  });
});

test.describe("the opening screen", () => {
  test("shows once a session, hands over to the hero by itself, and is gone on the next load", async ({ context }) => {
    const page = await context.newPage();
    // The page's own timers wait for the test, so the handover happens when the test says.
    await page.clock.install();
    await page.goto("/");
    const boot = page.locator(".boot");
    await expect(boot).toBeVisible();
    await expect(boot.locator(".boot-title")).toHaveText("Sergey Bar");
    // The page is already there underneath, its own name waiting for the handover.
    await expect(page.getByRole("heading", { level: 1, name: "Sergey Bar", includeHidden: true })).toBeAttached();
    await expect(page.locator(".hero-name")).toHaveCSS("visibility", "hidden");
    await page.clock.runFor(1_400);
    await expect(page.locator("html")).toHaveAttribute("data-boot", /handover|lifting/);
    await page.clock.runFor(1_000);
    await expect(page.locator("html")).not.toHaveAttribute("data-boot");
    await expect(boot).toBeHidden();
    await expect(page.locator(".hero-name")).toHaveCSS("visibility", "visible");
    await page.reload();
    await expect(page.locator("html")).not.toHaveAttribute("data-boot");
    await expect(boot).toBeHidden();
  });

  test("a key lifts it at once", async ({ context }) => {
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator(".boot")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator(".boot")).toBeHidden({ timeout: 1_000 });
  });

  test("never shows when the system asks for reduced motion", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("http://localhost:4173/");
    await expect(page.locator("html")).not.toHaveAttribute("data-boot");
    await expect(page.locator(".boot")).toBeHidden();
    await context.close();
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the whole record is there and the contents still jump", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(SECTIONS.length);
    await expect(page.locator(".composer")).toBeHidden();
    await expect(page.getByRole("button", { name: "Contents", exact: true })).toBeHidden();
  });
});

test.describe("projects", () => {
  test("lead with a few words; the rest opens on request", async ({ page }) => {
    await page.goto("/#projects");
    const card = page.locator("#projects .card").first();
    await expect(card.locator(".card-title")).toHaveText("Mjolnir");
    await expect(card.locator(".card-stat-value")).toBeVisible();
    await expect(card.getByRole("link", { name: "Open on GitHub" })).toBeVisible();
    const detail = card.locator(".more");
    await expect(detail).not.toHaveAttribute("open");
    await expect(card.locator(".facts")).toBeHidden();
    await detail.locator("summary").click();
    await expect(card.locator(".facts")).toBeVisible();
  });
});

test.describe("contents", () => {
  test("the pause control is a row of the sidebar that overlaps nothing", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Contents", exact: true }).click();
    const toggle = page.getByRole("button", { name: "Pause motion" });
    await expect(toggle).toBeVisible();
    const clash = await page.evaluate(() => {
      const control = document.querySelector(".motion-toggle")!.getBoundingClientRect();
      const others = Array.from(document.querySelectorAll<HTMLElement>(".sidebar a, .sidebar button, .sidebar p"))
        .filter((el) => !el.classList.contains("motion-toggle") && el.getBoundingClientRect().width > 0);
      return others
        .filter((el) => {
          const box = el.getBoundingClientRect();
          return box.left < control.right && box.right > control.left && box.top < control.bottom && box.bottom > control.top;
        })
        .map((el) => el.textContent?.trim());
    });
    expect(clash).toEqual([]);
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    await expect(page.getByRole("button", { name: "Resume motion" })).toBeVisible();
  });

  test("list every section, numbered, and mark the one in view", async ({ page }) => {
    await page.goto("/");
    const nav = await contents(page);
    const links = nav.getByRole("link");
    await expect(links).toHaveCount(SECTIONS.length);
    await expect(links.first()).toContainText("01");
    await links.filter({ hasText: "Experience" }).click();
    await expect(page).toHaveURL(/#experience$/);
    await expect(heading(page, "experience")).toBeInViewport();
    await expect(page.locator('.side-item[aria-current="location"]')).toContainText("Experience");
  });

  test("on a phone they are a drawer that closes on a jump and on Escape", async ({ page, isMobile }) => {
    test.skip(!isMobile, "the drawer is the narrow layout");
    await page.goto("/");
    const menu = page.getByRole("button", { name: "Contents", exact: true });
    await menu.click();
    await expect(page.locator(".sidebar")).toBeVisible();
    await expect(page.locator(".side-close")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator(".sidebar")).toBeHidden();
    await expect(menu).toBeFocused();
    await menu.click();
    await page.getByRole("navigation", { name: "Contents" }).getByRole("link", { name: /Toolbox/ }).click();
    await expect(page.locator(".sidebar")).toBeHidden();
    await expect(heading(page, "toolbox")).toBeInViewport();
    // The bar at the top names the section in view.
    await expect(page.locator(".topline-section")).toHaveText("Toolbox");
  });

  test("Back walks the sections visited before it leaves the page", async ({ page }) => {
    await page.goto("/");
    let nav = await contents(page);
    await nav.getByRole("link", { name: /Projects/ }).click();
    await expect(heading(page, "projects")).toBeInViewport();
    nav = await contents(page);
    await nav.getByRole("link", { name: /Contact/ }).click();
    await expect(page).toHaveURL(/#contact$/);
    await page.goBack();
    await expect(page).toHaveURL(/#projects$/);
    await expect(heading(page, "projects")).toBeInViewport();
    await page.goBack();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
  });

  test("an old anchor lands on its section under the section's own address", async ({ page }) => {
    await page.goto("/#case-studies");
    await expect(page).toHaveURL(/\/#cases$/);
    await expect(heading(page, "cases")).toBeInViewport();
    await page.goto("/?topic=toolbox");
    await expect(page).toHaveURL(/\/#toolbox$/);
    await expect(heading(page, "toolbox")).toBeInViewport();
  });
});

test.describe("the ask bar", () => {
  test("its topics are open from the start; only the plus closes them, and they stay closed", async ({ page }) => {
    await page.goto("/");
    const chips = page.locator(".composer-topics .chip[data-topic]");
    await expect(chips).toHaveCount(SECTIONS.length);
    await expect(chips.first()).toBeVisible();
    await expect(page.locator(".composer .chip-route")).toHaveCount(3);
    await expect(page.locator(".composer .ultra")).toHaveText("Ultra");
    await chips.filter({ hasText: "Projects" }).click();
    await expect(heading(page, "projects")).toBeInViewport();
    await expect(chips.first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(chips.first()).toBeVisible();
    await page.getByRole("button", { name: "Hide the topics" }).click();
    await expect(chips.first()).toBeHidden();
    await ask(page, "how do I reach you");
    await expect(heading(page, "contact")).toBeInViewport();
    await expect(chips.first()).toBeHidden();
    await page.getByRole("button", { name: "Show every topic" }).click();
    await expect(chips.first()).toBeVisible();
  });

  test("previews the section a question would go to while it is typed", async ({ page }) => {
    await page.goto("/");
    await field(page).fill("tell me about your projects");
    await expect(page.locator(".composer-panel")).toHaveAttribute("data-match", "projects");
  });

  test("a question takes the reader to the section that answers it", async ({ page }) => {
    await page.goto("/");
    await ask(page, "where did you work before?");
    await expect(page).toHaveURL(/#experience$/);
    await expect(heading(page, "experience")).toBeInViewport();
    const reply = page.locator(".ask-reply-card");
    await expect(reply).toContainText("where did you work before?");
    await expect(reply).toContainText("Showing Experience");
  });

  const routes: [string, string][] = [
    ["Do you know Java?", "toolbox"],
    ["Postman", "toolbox"],
    ["phone number", "contact"],
    ["Can I get your CV?", "contact"],
    ["where do you live", "about"],
  ];
  for (const [question, id] of routes) {
    test(`"${question}" goes to ${id}`, async ({ page }) => {
      await page.goto("/");
      await ask(page, question);
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(heading(page, id)).toBeInViewport();
    });
  }

  test("a tool's name is handed to the toolbox's own search", async ({ page }) => {
    await page.goto("/");
    await ask(page, "Do you know Java?");
    await expect(page.locator('#toolbox input[type="search"]')).toHaveValue("java");
    await expect(page.locator("#toolbox").getByText("Languages")).toBeVisible();
    await expect(page.locator(".ask-reply-card")).toContainText("searched for “java”");
  });

  test("a tool the toolbox does not list is said so, not missed", async ({ page }) => {
    await page.goto("/");
    await ask(page, "Do you use Puppeteer?");
    const reply = page.locator(".ask-reply-card");
    await expect(reply).toContainText("Puppeteer is not in my toolbox.");
    await expect(reply.locator('.chip[data-topic="toolbox"]')).toBeVisible();
  });

  test("a framework Mjolnir reads points to the project that reads it", async ({ page }) => {
    await page.goto("/");
    await ask(page, "Selenium");
    const reply = page.locator(".ask-reply-card");
    await expect(reply).toContainText("Mjolnir, my open-source scanner, does read Selenium suites");
    await reply.locator('.chip[data-topic="projects"]').click();
    await expect(heading(page, "projects")).toBeInViewport();
    await expect(reply).toBeHidden();
  });

  test("answers a greeting, in English or in Hebrew", async ({ page }) => {
    await page.goto("/");
    await ask(page, "hello");
    await expect(page.locator(".ask-reply-card")).toContainText("Ask about my work");
    await ask(page, "שלום");
    await expect(page.locator(".ask-reply-card")).toContainText("Ask about my work");
  });

  test("admits what it does not know, and stays accessible while it says so", async ({ page }) => {
    await page.goto("/");
    await ask(page, "what is the meaning of life");
    const reply = page.locator(".ask-reply-card");
    await expect(reply).toContainText("No section answers that one yet");
    await expectAxeClean(page);
    await reply.getByRole("button", { name: "Close the reply" }).click();
    await expect(reply).toBeHidden();
  });

  test("a long word breaks inside the reply instead of running off the screen", async ({ page }) => {
    await page.goto("/");
    await ask(page, "x".repeat(140));
    const question = page.locator(".ask-question");
    await expect(question).toBeVisible();
    const fit = await question.evaluate((el) => ({
      inside: el.scrollWidth <= el.clientWidth,
      right: el.getBoundingClientRect().right,
      viewport: document.documentElement.clientWidth,
    }));
    expect(fit.inside).toBe(true);
    expect(fit.right).toBeLessThanOrEqual(fit.viewport);
  });

  test("the slash key focuses the field and Escape leaves it", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard shortcuts are for devices with a keyboard");
    await page.goto("/");
    await page.locator(".hero-pitch").click();
    await page.keyboard.press("/");
    await expect(field(page)).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(field(page)).not.toBeFocused();
  });

  test("a link reached by Tab is never hidden behind the ask bar", async ({ page, isMobile }) => {
    test.skip(isMobile, "sequential focus is for devices with a keyboard");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#projects");
    await heading(page, "projects").click();
    let checked = 0;
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const state = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el?.closest(".home-column")) return null;
        const bar = document.querySelector(".composer-panel")!.getBoundingClientRect();
        const box = el.getBoundingClientRect();
        return { name: el.textContent?.trim().slice(0, 40), bottom: box.bottom, limit: bar.top };
      });
      if (!state) continue;
      checked += 1;
      expect(state.bottom, `"${state.name}" is under the ask bar`).toBeLessThanOrEqual(state.limit);
    }
    expect(checked).toBeGreaterThan(0);
  });
});

test.describe("something fun", () => {
  test("the button opens the game, Escape closes it, and the page is as it was", async ({ page }) => {
    await page.goto("/#fun");
    await page.getByRole("button", { name: "DO NOT PRESS THIS BUTTON" }).click();
    const game = page.getByRole("dialog");
    await expect(game).toBeVisible();
    await expect(game.getByRole("button", { name: /sound/i })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(game).toBeHidden();
    await expect(page.locator(".composer-topics .chip").first()).toBeVisible();
  });
});

test.describe("content", () => {
  test("case studies are the two cases; Mjolnir is told once, under Projects", async ({ page }) => {
    await page.goto("/#cases");
    await expect(page.locator("#cases .card-title")).toHaveText([
      "Quality from zero on a security-critical platform",
      "A memory leak root-caused on a $30M video platform",
    ]);
    await expect(page.locator("#cases").getByText(/green build means anything/)).toHaveCount(0);
    await expect(page.locator("#cases").getByText("80/100")).toHaveCount(0);
  });

  test("the toolbox carries no note about generated code", async ({ page }) => {
    await page.goto("/#toolbox");
    await page.locator("#toolbox").getByRole("button", { name: /Explore all/ }).click();
    await expect(page.locator("#toolbox").getByText(/Used to build and to review/)).toHaveCount(0);
  });

  test("the employers are the white marks made for the dark ground", async ({ page }) => {
    await page.goto("/");
    const marks = page.locator(".employers img");
    await expect(marks).toHaveCount(5);
    for (const src of await marks.evaluateAll((imgs) => imgs.map((img) => img.getAttribute("src")))) {
      expect(src).toMatch(/-on-dark\.(svg|png)$/);
    }
    for (let i = 0; i < 5; i++) await expect(marks.nth(i)).toHaveJSProperty("complete", true);
  });

  test("something fun lists the game's nine tools and opens it from its own corner", async ({ page }) => {
    await page.goto("/#fun");
    await expect(page.locator("#fun .fun-tools li")).toHaveCount(9);
    await expect(page.locator("#fun .card-title")).toHaveText("Wreck the release machine");
    await expect(page.locator("#fun .fun-zone").getByRole("button", { name: "DO NOT PRESS THIS BUTTON" })).toBeVisible();
  });
});

test.describe("readability", () => {
  /**
   * Every visible text: at least 12px, and at least 4.5:1 against what it
   * sits on (3:1 for large text). Backgrounds are composed up the tree from
   * the page's own ground, the way they are painted.
   */
  test("every text is large enough and has the contrast to read", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
    const problems = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const g = canvas.getContext("2d", { willReadFrequently: true })!;
      const rgba = (c: string) => {
        g.clearRect(0, 0, 1, 1);
        g.fillStyle = "#000";
        g.fillStyle = c;
        g.fillRect(0, 0, 1, 1);
        const d = g.getImageData(0, 0, 1, 1).data;
        return [d[0], d[1], d[2], d[3] / 255];
      };
      const lum = ([r, gg, b]: number[]) => {
        const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        return 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(b);
      };
      const ground = rgba(getComputedStyle(document.querySelector(".page-bg")!).backgroundColor);
      const behind = (el: Element) => {
        const layers: number[][] = [];
        for (let n: Element | null = el; n; n = n.parentElement) {
          const c = rgba(getComputedStyle(n).backgroundColor);
          if (c[3] > 0) layers.push(c);
          if (c[3] >= 0.99) break;
        }
        return layers.reverse().reduce((base, c) => base.map((v, i) => (i < 3 ? v * (1 - c[3]) + c[i] * c[3] : 1)), ground);
      };
      const out: string[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let t = walker.nextNode(); t; t = walker.nextNode()) {
        const el = t.parentElement!;
        if (!t.textContent?.trim() || el.closest(".sr-only, script, style, .boot, [aria-hidden='true']")) continue;
        const box = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (box.width < 2 || cs.visibility === "hidden" || !el.checkVisibility()) continue;
        const size = parseFloat(cs.fontSize);
        const label = `"${t.textContent.trim().slice(0, 30)}" (${el.className || el.tagName})`;
        if (size < 12) out.push(`${label} is ${size}px`);
        const fill = cs.webkitTextFillColor ? rgba(cs.webkitTextFillColor) : null;
        if (fill && fill[3] === 0) continue; // gradient text, drawn by its background
        const bg = behind(el);
        const c = rgba(cs.color);
        const fg = c.map((v, i) => (i < 3 ? v * c[3] + bg[i] * (1 - c[3]) : 1));
        const ratio = (Math.max(lum(fg), lum(bg)) + 0.05) / (Math.min(lum(fg), lum(bg)) + 0.05);
        const large = size >= 24 || (size >= 18.66 && parseInt(cs.fontWeight) >= 700);
        if (ratio < (large ? 3 : 4.5)) out.push(`${label} is ${ratio.toFixed(2)}:1`);
      }
      return [...new Set(out)];
    });
    expect(problems).toEqual([]);
  });
});

test.describe("the 404", () => {
  test("says so and links every section", async ({ page }) => {
    const response = await page.goto("/no-such-page/");
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/Page not found/);
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Projects" }).first()).toHaveAttribute("href", /#projects/);
    await expectAxeClean(page);
  });

  test("the old long pages are gone", async ({ page }) => {
    for (const path of ["/projects/", "/colophon/", "/accessibility/"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
    }
  });
});
