const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const root = process.cwd();
const distDir = path.join(root, "dist");
const outDir = path.join(root, "tmp", "verify-screenshots");
fs.mkdirSync(outDir, { recursive: true });

const paths = [
  "/",
  "/algorithm",
  "/audience-portrait",
  "/sku-budget",
  "/demand-elasticity",
];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1000 },
];

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function createStaticServer() {
  return http.createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const rawPath = decodeURIComponent(url.pathname);
    let filePath = path.join(distDir, rawPath);

    if (!filePath.startsWith(distDir)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": contentTypes[ext] ?? "application/octet-stream",
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

(async () => {
  if (!fs.existsSync(path.join(distDir, "index.html"))) {
    throw new Error(`Build output not found: ${pathToFileURL(distDir).href}`);
  }

  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch({
    headless: true,
    executablePath: edgePath,
  });
  const results = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const consoleErrors = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    for (const routePath of paths) {
      const response = await page.goto(`${baseUrl}${routePath}`, {
        waitUntil: "networkidle",
        timeout: 20000,
      });
      await page.waitForSelector("h1", { timeout: 10000 });
      await page.evaluate(async () => {
        const step = Math.max(320, Math.floor(window.innerHeight * 0.75));
        for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState("networkidle");

      const metrics = await page.evaluate(() => ({
        h1: document.querySelector("h1")?.textContent?.trim() ?? "",
        bodyText: document.body.innerText.length,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollHeight: document.documentElement.scrollHeight,
        links: document.querySelectorAll("a").length,
        buttons: document.querySelectorAll("button").length,
        images: document.querySelectorAll("img").length,
        brokenImages: Array.from(document.querySelectorAll("img")).filter(
          (image) => image.naturalWidth === 0
        ).length,
      }));

      const slug = routePath === "/" ? "home" : routePath.slice(1);
      const screenshot = path.join(outDir, `${viewport.name}-${slug}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });

      results.push({
        viewport: viewport.name,
        path: routePath,
        status: response?.status(),
        screenshot: path.relative(root, screenshot),
        overflowX: metrics.scrollWidth > metrics.clientWidth + 1,
        errors: [...consoleErrors],
        ...metrics,
      });
      consoleErrors.length = 0;
    }

    await page.close();
  }

  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  console.log(JSON.stringify(results, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
