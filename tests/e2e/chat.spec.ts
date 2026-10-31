import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * The conversation, tested as a product. Every spec runs against the built
 * static export.
 */

const TOPICS = ["about", "projects", "cases", "experience", "recommendations", "toolbox", "contact", "fun"] as const;

async function open(page: Page, path = "/") {
  await page.goto(path);
  await expect(page.locator(".chat-shell")).toHaveAttribute("data-state", "intro");
}

/**
 * Opens the page under a fake clock and freezes it a moment after load, so the
 * three-second wait is advanced by the test alone and real load time cannot eat
 * into it.
 */
async function openFrozen(page: Page) {
  await page.clock.install();
  await open(page);
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 700);
}

/** Opens the page and goes straight into the chat by pressing the loading line. */
async function enter(page: Page) {
  await open(page);
  await page.locator("[data-loader]").click();
  await expect(page.locator(".chat-shell")).toHaveAttribute("data-state", "chat", { timeout: 10_000 });
  await expect(page.locator(".entry .bubble").first()).toBeVisible();
}

/**
 * Asks a topic the way the layout offers it: the sidebar item on a wide screen,
 * the composer chip behind the plus (opening the panel first when needed).
 */
async function pressChip(page: Page, id: string) {
  const side = page.locator(`.sidebar .side-item[data-ask="${id}"]`);
  if (await side.isVisible()) {
    await side.click();
    return;
  }
  const chip = page.locator(`.composer .chip[data-ask="${id}"]`);
  if (!(await chip.isVisible())) await page.getByRole("button", { name: "Show every topic" }).click();
  await chip.click();
}

async function expectAxeClean(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
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

  test("there is no opening veil: the intro is the first thing on screen", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".boot")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-boot");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("the loading line stays for the whole wait, counts down, and changes on the next load", async ({ page }) => {
    await openFrozen(page);
    const text = page.locator(".loader-text");
    await expect(text).not.toHaveText("Booting the chat…");
    const first = await text.textContent();
    await expect(page.locator(".loader-count")).toHaveCount(0);
    await page.clock.runFor(1_500);
    await expect(text).toHaveText(first ?? "");
    await expect(page.locator(".loader-count")).toHaveText(/Ready in [12]/);
    await page.clock.resume();
    await page.reload();
    await expect(text).not.toHaveText("Booting the chat…");
    expect(await text.textContent()).not.toBe(first);
  });

  test("the chat opens by itself after three seconds with every topic offered", async ({ page }) => {
    await openFrozen(page);
    await page.clock.runFor(1_500);
    await expect(page.locator(".chat-shell")).toHaveAttribute("data-state", "intro");
    await page.clock.runFor(1_500);
    await page.clock.resume();
    await expect(page.locator(".chat-shell")).toHaveAttribute("data-state", "chat", { timeout: 10_000 });
    await expect(page.locator(".entry .bubble").first()).toBeVisible();
    await expect(page.locator(".entry .replies .chip")).toHaveCount(0);
    await expect(page.locator(".composer .chip[data-ask]")).toHaveCount(TOPICS.length);
  });

  test("every topic is listed in the sidebar and marked once asked", async ({ page, isMobile }) => {
    test.skip(isMobile, "phones carry the topics in a drawer and the folded row");
    await enter(page);
    const items = page.locator(".sidebar .side-item[data-ask]");
    await expect(items).toHaveCount(TOPICS.length);
    for (let i = 0; i < TOPICS.length; i++) await expect(items.nth(i)).toBeInViewport();
    await items.first().click();
    await expect(page.locator('.sidebar .side-item[data-ask="about"]')).toHaveAttribute("data-asked", "");
  });

  test("the loading screen shows no controls; the routes out live in the sidebar", async ({ page, isMobile }) => {
    await open(page);
    await expect(page.locator(".topbar")).toBeHidden();
    await expect(page.locator(".motion-control")).toBeHidden();
    await expect(page.locator(".corner-restart")).toHaveCount(0);
    await enter(page);
    await expect(page.locator(".topbar")).toBeVisible();
    if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
    const sidebar = page.locator(".sidebar");
    await expect(sidebar.getByRole("link", { name: "GitHub" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "LinkedIn" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Email" })).toHaveAttribute("href", /^mailto:/);
  });

  test("the ghost in the corner opens the game directly", async ({ page }) => {
    await enter(page);
    await page.getByRole("button", { name: "Play the demolition run" }).click();
    const game = page.getByRole("dialog");
    await expect(game).toBeVisible();
    await expect(page.locator("[data-flow][data-sent]")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(game).toBeHidden();
    await expect(page.locator(".chat-shell")).toHaveAttribute("data-state", "chat");
  });

  test("a phone opens the sidebar as a drawer", async ({ page, isMobile }) => {
    test.skip(!isMobile, "the drawer is a phone layout");
    await enter(page);
    await expect(page.locator(".sidebar")).toBeHidden();
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator(".sidebar")).toBeVisible();
    await page.locator('.sidebar .side-item[data-ask="toolbox"]').click();
    await expect(page.locator(".sidebar")).toBeHidden();
    await expect(page.locator('[data-flow="toolbox"]')).toHaveAttribute("data-sent", "");
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
  // "Something fun" opens the game rather than an answer; its own spec is below.
  for (const id of TOPICS.filter((topic) => topic !== "fun")) {
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

  test("the fun chip opens the game straight away, with no start card", async ({ page }) => {
    await enter(page);
    await pressChip(page, "fun");
    const game = page.getByRole("dialog");
    await expect(game).toBeVisible();
    await expect(game.getByRole("button", { name: /start/i })).toHaveCount(0);
    await expect(game.getByRole("button", { name: /sound/i })).toBeVisible();
    await expect(page.locator('[data-flow="fun"]')).not.toHaveAttribute("data-sent");
    await page.keyboard.press("Escape");
    await expect(game).toBeHidden();
  });

  test("asking the same thing twice points back instead of repeating", async ({ page }) => {
    await enter(page);
    await pressChip(page, "contact");
    await expect(page.locator('[data-flow="contact"] .replies')).toBeVisible({ timeout: 20_000 });
    await pressChip(page, "contact");
    await expect(page.locator(".entry").getByText("That one is above.")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[data-flow="contact"]')).toHaveCount(1);
  });

  test("start over returns to the intro and clears the log", async ({ page }) => {
    await enter(page);
    await pressChip(page, "toolbox");
    await expect(page.locator('[data-flow="toolbox"] .replies')).toBeVisible({ timeout: 20_000 });
    // One press, no confirmation step.
    await page.getByRole("button", { name: "Start over" }).first().click();
    await expect(page.locator(".chat-shell")).toHaveAttribute("data-state", "intro");
    await expect(page.locator("[data-flow][data-sent]")).toHaveCount(0);
    await expect(page.locator(".entry")).toHaveCount(0);
  });

  test("reading mode leads the panel and fits it in two rows on a wide screen", async ({ page, isMobile }) => {
    await enter(page);
    const first = page.locator(".composer-topics .chip").first();
    await expect(first).toHaveAccessibleName("Read everything");
    const tops = await page
      .locator(".composer-topics .chip")
      .evaluateAll((nodes) => new Set(nodes.map((n) => Math.round(n.getBoundingClientRect().top))).size);
    // Two rows on a wide screen; a phone's grid of tiles is three rows of four, all in view.
    expect(tops).toBeLessThanOrEqual(isMobile ? 3 : 2);
    if (isMobile) {
      const tiles = page.locator(".composer-topics .chip");
      for (let i = 0; i < (await tiles.count()); i++) await expect(tiles.nth(i)).toBeInViewport();
    }
    await expect(page.locator(".composer .chip-route")).toHaveCount(3);
    await first.click();
    await expect(page.locator(".chat-shell")).toHaveAttribute("data-mode", "read");
    await expect(page.locator("[data-flow][data-sent]")).toHaveCount(TOPICS.length);
  });

  test("reading mode shows every answer at once, in order", async ({ page, isMobile }) => {
    test.skip(isMobile, "reading mode is offered on wider screens");
    await enter(page);
    await pressChip(page, "contact");
    await page.getByRole("button", { name: "Read everything" }).click();
    await expect(page.locator(".chat-shell")).toHaveAttribute("data-mode", "read");
    const flows = page.locator("[data-flow]");
    await expect(flows).toHaveCount(TOPICS.length);
    await expect(page.locator("[data-flow][data-sent]")).toHaveCount(TOPICS.length);
    await expect(page.locator("[data-flow] > [data-msg]:not([data-sent])")).toHaveCount(0);
    const orders = await flows.evaluateAll((nodes) => nodes.map((n) => Number((n as HTMLElement).style.order)));
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    await expectAxeClean(page);
  });

  test("the panel behind the plus opens with the chat, a chip closes it, the plus reopens it", async ({ page }) => {
    await enter(page);
    const chips = page.locator(".composer .chip[data-ask]");
    await expect(chips).toHaveCount(TOPICS.length);
    for (let i = 0; i < TOPICS.length; i++) await expect(chips.nth(i)).toBeInViewport();
    await expect(page.getByRole("button", { name: "Hide the topics" })).toHaveAttribute("aria-pressed", "true");
    const routes = page.locator(".composer .chips-routes");
    await expect(routes.getByRole("link", { name: "GitHub" })).toBeVisible();
    await expect(routes.getByRole("link", { name: "LinkedIn" })).toBeVisible();
    await expect(routes.getByRole("link", { name: "Email" })).toHaveAttribute("href", /^mailto:/);
    await page.locator('.composer .chip[data-ask="experience"]').click();
    await expect(page.locator('[data-flow="experience"]')).toHaveAttribute("data-sent", "");
    await expect(chips.first()).toBeHidden();
    // Once the whole answer is in, every topic comes back for the next question.
    const flow = page.locator('[data-flow="experience"]');
    const total = await flow.locator(":scope > [data-msg]").count();
    await expect(flow.locator(":scope > [data-msg][data-sent]")).toHaveCount(total, { timeout: 20_000 });
    await expect(chips.first()).toBeVisible();
    await page.getByRole("button", { name: "Hide the topics" }).click();
    await expect(chips.first()).toBeHidden();
    await page.getByRole("button", { name: "Show every topic" }).click();
    await expect(chips.first()).toBeVisible();
  });

  test("the bar under the field reads like a model's and has no microphone", async ({ page }) => {
    await enter(page);
    await expect(page.locator(".composer .model-name")).toHaveText("Sergey Bar");
    await expect(page.locator(".composer .model-effort")).toHaveText("Ultra");
    await expect(page.getByRole("button", { name: /microphone|dictate|voice/i })).toHaveCount(0);
    await expect(page.locator(".identity .msg-avatar")).toHaveCount(0);
    await expect(page.locator(".log .msg-avatar")).toHaveCount(0);
    await expect(page.locator(".identity-name")).toHaveCount(0);
    // The name stands once in the sidebar, at the foot; nothing above it.
    await expect(page.locator(".sidebar .side-foot-name")).toHaveText("Sergey Bar");
    await expect(page.locator(".sidebar .side-brand, .sidebar .side-mark")).toHaveCount(0);
    await expect(page.locator(".corner-restart")).toBeVisible();
  });

  test("a legacy anchor opens its conversation on arrival", async ({ page }) => {
    await page.goto("/#experience");
    await expect(page.locator('[data-flow="experience"]')).toHaveAttribute("data-sent", "", { timeout: 10_000 });
    await expect(page.locator(".chat-shell")).toHaveAttribute("data-state", "chat");
  });

  test("a ?topic= link opens its answer under the topic's own address", async ({ page }) => {
    await page.goto("/?topic=toolbox");
    await expect(page.locator('[data-flow="toolbox"]')).toHaveAttribute("data-sent", "", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/#toolbox$/);
  });

  test("each answer has an address, and Back walks the answers before leaving", async ({ page }) => {
    await enter(page);
    await expect(page).toHaveURL(/\/$/);
    await pressChip(page, "projects");
    await expect(page).toHaveURL(/#projects$/);
    await expect(page.locator('[data-flow="projects"] .replies')).toBeVisible({ timeout: 20_000 });
    await pressChip(page, "contact");
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator('[data-flow="contact"] .replies')).toBeVisible({ timeout: 20_000 });

    await page.goBack();
    await expect(page).toHaveURL(/#projects$/);
    await expect(page.locator('[data-flow="projects"] > [data-msg]:not(.user)').first()).toBeInViewport();
    await page.goBack();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await expect(page.locator(".chat-shell")).toHaveAttribute("data-state", "chat");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);

    await page.goForward();
    await expect(page).toHaveURL(/#projects$/);
    // Every step stayed inside the one conversation: nothing was asked twice.
    await expect(page.locator('[data-flow="projects"]')).toHaveCount(1);
    await expect(page.locator(".entry").getByText("That one is above.")).toHaveCount(0);
  });

  test("a link reached by Tab is never hidden behind the composer", async ({ page, isMobile }) => {
    test.skip(isMobile, "sequential focus is for devices with a keyboard");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await enter(page);
    await pressChip(page, "projects");
    await expect(page.locator('[data-flow="projects"] .replies')).toBeVisible({ timeout: 20_000 });
    await page.locator('[data-flow="projects"] > [data-msg]:not(.user)').first().click();
    let checked = 0;
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const state = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el?.closest(".log")) return null;
        const panel = document.querySelector(".composer-panel")!.getBoundingClientRect();
        const box = el.getBoundingClientRect();
        return { name: el.textContent?.trim().slice(0, 40), bottom: box.bottom, limit: panel.top };
      });
      if (!state) continue;
      checked += 1;
      expect(state.bottom, `"${state.name}" is under the composer`).toBeLessThanOrEqual(state.limit);
    }
    expect(checked).toBeGreaterThan(0);
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

  test("the opening message is typed out letter by letter, once", async ({ page }) => {
    await enter(page);
    const typed = page.locator(".entry .typed-line").first();
    await expect(typed).toBeVisible();
    // Part of the way through, only a part of the text is shown.
    const early = await page.locator(".entry .typed-line > span:first-child").first().textContent();
    expect((early ?? "").length).toBeLessThan(60);
    await expect(page.locator(".entry .typed-caret")).toHaveCount(1);
    // The whole message is there for a screen reader from the first frame.
    await expect(page.locator(".entry .sr-only").first()).toContainText("introduce myself");
    // When the writing is done the caret is gone and the full text is shown.
    await expect(page.locator(".entry .typed-caret")).toHaveCount(0, { timeout: 20_000 });
    await expect(page.locator(".entry .typed-line").last()).toContainText("Press any button below");
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

  test("a long word breaks inside the visitor's bubble", async ({ page }) => {
    await enter(page);
    await ask(page, "x".repeat(140));
    const bubble = page.locator(".entry .msg.user .bubble").last();
    await expect(bubble).toBeVisible();
    const fit = await bubble.evaluate((el) => ({
      inside: el.scrollWidth <= el.clientWidth,
      right: el.getBoundingClientRect().right,
      viewport: document.documentElement.clientWidth,
    }));
    expect(fit.inside).toBe(true);
    expect(fit.right).toBeLessThanOrEqual(fit.viewport);
  });

  const routes: [string, string][] = [
    ["Do you know Java?", "toolbox"],
    ["Postman", "toolbox"],
    ["phone number", "contact"],
    ["Can I get your CV?", "contact"],
    ["where do you live", "about"],
  ];
  for (const [question, id] of routes) {
    test(`"${question}" is answered by ${id}`, async ({ page }) => {
      await enter(page);
      await ask(page, question);
      await expect(page.locator(`[data-flow="${id}"]`)).toHaveAttribute("data-sent", "", { timeout: 10_000 });
    });
  }

  test("a tool the toolbox does not list is said so, not missed", async ({ page }) => {
    await enter(page);
    await ask(page, "Do you use Puppeteer?");
    await expect(page.locator(".entry").getByText(/Puppeteer is not in my toolbox\./)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.entry .chip[data-ask="toolbox"]')).toBeVisible();
    await expect(page.locator(".entry").getByText(/don.t have an answer/)).toHaveCount(0);
  });

  test("a framework Mjolnir reads points to the project that reads it", async ({ page }) => {
    await enter(page);
    await ask(page, "Selenium");
    await expect(page.locator(".entry").getByText(/Mjolnir, my open-source scanner, does read Selenium suites/)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.entry .chip[data-ask="projects"]')).toBeVisible();
  });

  test("a greeting in Hebrew is answered as one", async ({ page }) => {
    await enter(page);
    await ask(page, "שלום");
    await expect(page.locator(".entry").getByText(/Ask me anything about my work/)).toBeVisible({ timeout: 10_000 });
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
