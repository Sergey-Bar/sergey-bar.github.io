import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * The home page, tested as a product: a document a reader takes in, with
 * contents beside it and an ask bar under it. Every spec runs against the
 * built static export.
 */

const SECTIONS = [
  ["about", "About me"],
  ["projects", "Projects"],
  ["cases", "Case studies"],
  ["experience", "Experience"],
  ["recommendations", "Recommendations"],
  ["toolbox", "Toolbox"],
  ["contact", "Contact"],
  ["fun", "Something fun"],
] as const;

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
    // No loader, no intro to sit through.
    await expect(page.locator("[data-loader], .intro, .typing")).toHaveCount(0);
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

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the whole record is there and the contents still jump", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(SECTIONS.length);
    await expect(page.locator(".composer")).toBeHidden();
    await expect(page.getByRole("button", { name: "Contents", exact: true })).toBeHidden();
  });
});

test.describe("contents", () => {
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
    await page.locator("body").click({ position: { x: 600, y: 300 } });
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

test.describe("routes", () => {
  for (const path of ["/projects/", "/colophon/", "/accessibility/"]) {
    test(`${path} renders and passes the accessibility audit`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("link", { name: "LinkedIn" }).first()).toBeVisible();
      await expectAxeClean(page);
    });
  }

  test("a missing page says so and links every section", async ({ page }) => {
    const response = await page.goto("/no-such-page/");
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/Page not found/);
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Projects" }).first()).toHaveAttribute("href", /#projects/);
  });
});
