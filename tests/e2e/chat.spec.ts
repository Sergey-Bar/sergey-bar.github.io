import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * The conversation, tested as a product. Every spec runs against the built
 * static export; the opening veil is skipped by marking the tab session as
 * booted before the page loads, and one spec covers the veil itself.
 */

const TOPICS = ["about", "projects", "cases", "experience", "recommendations", "toolbox", "contact", "fun"] as const;

async function open(page: Page, path = "/") {
  await page.addInitScript(() => sessionStorage.setItem("booted", "1"));
  await page.goto(path);
  await expect(page.locator(".chat-shell")).toHaveAttribute("data-state", "intro");
}

/** Opens the page and goes straight into the chat by pressing the loading line. */
async function enter(page: Page) {
  await open(page);
  await page.locator("[data-loader]").click();
  await expect(page.locator(".chat-shell")).toHaveAttribute("data-state", "chat", { timeout: 10_000 });
  await expect(page.locator(".entry .bubble").first()).toBeVisible();
}

/** Presses a composer chip; on a phone the row is folded, so it is opened first. */
async function pressChip(page: Page, id: string) {
  const chip = page.locator(`.composer .chip[data-ask="${id}"]`);
  if (!(await chip.isVisible())) await page.locator(".composer .chips-more").click();
  await chip.click();
}

async function expectAxeClean(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude(".boot")
    .analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
}

test.describe("intro", () => {
  test("renders the name, the role and the ways in", async ({ page }) => {
    await open(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(/Sergey Bar/);
    await expect(page.getByRole("img", { name: "Sergey Bar" })).toBeVisible();
    await expect(page.locator("[data-loader]")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Ask about my work" })).toBeHidden();
    await expectAxeClean(page);
  });

  test("the opening veil plays once per session and a key ends it", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-boot", "");
    await expect(page.locator(".boot")).toBeVisible();
    await page.keyboard.press("Space");
    await expect(page.locator("html")).toHaveAttribute("data-boot", "skip");
    await expect(page.locator(".boot")).toBeHidden();
    await page.reload();
    await expect(page.locator("html")).not.toHaveAttribute("data-boot", "");
  });

  test("the chat opens by itself after ten seconds with every topic offered", async ({ page }) => {
    await page.clock.install();
    await open(page);
    await page.clock.runFor(9_000);
    await expect(page.locator(".chat-shell")).toHaveAttribute("data-state", "intro");
    await page.clock.runFor(2_000);
    await expect(page.locator(".chat-shell")).toHaveAttribute("data-state", "chat", { timeout: 10_000 });
    await expect(page.locator(".entry .bubble").first()).toBeVisible();
    await expect(page.locator(".entry .replies .chip")).toHaveCount(0);
    await expect(page.locator(".composer .chip[data-ask]")).toHaveCount(TOPICS.length);
  });

  test("has no horizontal overflow", async ({ page }) => {
    await open(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});

test.describe("conversations", () => {
  for (const id of TOPICS) {
    test(`the ${id} chip reveals every message of its answer`, async ({ page }) => {
      await enter(page);
      await pressChip(page, id);
      const flow = page.locator(`[data-flow="${id}"]`);
      await expect(page.locator(".chat-shell")).toHaveAttribute("data-state", "chat");
      await expect(flow).toHaveAttribute("data-sent", "");
      const total = await flow.locator(":scope > [data-msg]").count();
      await expect(flow.locator(":scope > [data-msg][data-sent]")).toHaveCount(total, { timeout: 20_000 });
      await expect(flow.locator(".typing")).toHaveCount(0);
      await expectAxeClean(page);
    });
  }

  test("quick replies inside an answer open the next one", async ({ page }) => {
    await enter(page);
    await pressChip(page, "about");
    const reply = page.locator('[data-flow="about"] .replies .chip[data-ask="cases"]');
    await expect(reply).toBeVisible({ timeout: 20_000 });
    await reply.click();
    await expect(page.locator('[data-flow="cases"]')).toHaveAttribute("data-sent", "");
  });

  test("answers appear in the order they were asked", async ({ page }) => {
    await enter(page);
    await pressChip(page, "contact");
    await expect(page.locator('[data-flow="contact"] .replies')).toBeVisible({ timeout: 20_000 });
    await pressChip(page, "about");
    const orders = await page.evaluate(() => ({
      contact: Number(document.querySelector<HTMLElement>('[data-flow="contact"]')?.style.order),
      about: Number(document.querySelector<HTMLElement>('[data-flow="about"]')?.style.order),
    }));
    expect(orders.contact).toBeLessThan(orders.about);
  });

  test("asking the same thing twice points back instead of repeating", async ({ page }) => {
    await enter(page);
    await pressChip(page, "fun");
    await expect(page.locator('[data-flow="fun"] .replies')).toBeVisible({ timeout: 20_000 });
    await pressChip(page, "fun");
    await expect(page.locator(".entry").getByText("That one is above.")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[data-flow="fun"]')).toHaveCount(1);
  });

  test("start over returns to the intro and clears the log", async ({ page }) => {
    await enter(page);
    await pressChip(page, "toolbox");
    await expect(page.locator('[data-flow="toolbox"] .replies')).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Start over" }).click();
    await expect(page.locator(".chat-shell")).toHaveAttribute("data-state", "intro");
    await expect(page.locator("[data-flow][data-sent]")).toHaveCount(0);
    await expect(page.locator(".entry")).toHaveCount(0);
  });

  test("reading mode shows every answer at once, in order", async ({ page, isMobile }) => {
    test.skip(isMobile, "reading mode is offered on wider screens");
    await enter(page);
    await pressChip(page, "contact");
    await page.getByRole("button", { name: "Read all" }).click();
    await expect(page.locator(".chat-shell")).toHaveAttribute("data-mode", "read");
    const flows = page.locator("[data-flow]");
    await expect(flows).toHaveCount(TOPICS.length);
    await expect(page.locator("[data-flow][data-sent]")).toHaveCount(TOPICS.length);
    await expect(page.locator("[data-flow] > [data-msg]:not([data-sent])")).toHaveCount(0);
    const orders = await flows.evaluateAll((nodes) => nodes.map((n) => Number((n as HTMLElement).style.order)));
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    await expectAxeClean(page);
  });

  test("a phone folds the chip row behind a count", async ({ page, isMobile }) => {
    test.skip(!isMobile, "the fold is a phone layout");
    await enter(page);
    await expect(page.locator('.composer .chip[data-ask="experience"]')).toBeHidden();
    await page.locator(".composer .chips-more").click();
    await expect(page.locator('.composer .chip[data-ask="experience"]')).toBeVisible();
  });

  test("a legacy anchor opens its conversation on arrival", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("booted", "1"));
    await page.goto("/#experience");
    await expect(page.locator('[data-flow="experience"]')).toHaveAttribute("data-sent", "", { timeout: 10_000 });
    await expect(page.locator(".chat-shell")).toHaveAttribute("data-state", "chat");
  });
});

test.describe("composer", () => {
  const ask = async (page: Page, text: string) => {
    const input = page.getByRole("textbox", { name: "Ask about my work" });
    await input.fill(text);
    await input.press("Enter");
  };

  test("routes a typed question and echoes the visitor's words", async ({ page }) => {
    await enter(page);
    await ask(page, "where did you work before?");
    await expect(page.locator(".entry .msg.user")).toHaveText(/where did you work before\?/);
    await expect(page.locator('[data-flow="experience"]')).toHaveAttribute("data-sent", "", { timeout: 10_000 });
    await expect(page.locator('[data-flow="experience"] > .msg.user')).toBeHidden();
  });

  test("previews the topic on the chips while typing", async ({ page }) => {
    await enter(page);
    await page.getByRole("textbox", { name: "Ask about my work" }).fill("tell me about your projects");
    await expect(page.locator(".composer-panel")).toHaveAttribute("data-match", "projects");
  });

  test("answers a greeting and admits what it does not know", async ({ page }) => {
    await enter(page);
    // The status line for assistive technology repeats each reply, so the
    // assertions look inside the log entries only.
    await ask(page, "hello");
    await expect(page.locator(".entry").getByText(/Ask me anything about my work/)).toBeVisible({ timeout: 10_000 });
    await ask(page, "what is the meaning of life");
    await expect(page.locator(".entry").getByText(/don.t have an answer for that one yet/)).toBeVisible({ timeout: 10_000 });
    await expectAxeClean(page);
  });

  test("the slash key focuses the composer and Escape leaves it", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard shortcuts are for devices with a keyboard");
    await enter(page);
    await page.locator("body").click({ position: { x: 5, y: 5 } });
    await page.keyboard.press("/");
    await expect(page.getByRole("textbox", { name: "Ask about my work" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("textbox", { name: "Ask about my work" })).not.toBeFocused();
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

  test("a missing page answers as a reply", async ({ page }) => {
    const response = await page.goto("/no-such-page/");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("That URL does not resolve.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Projects" }).first()).toHaveAttribute("href", /#projects/);
  });
});
