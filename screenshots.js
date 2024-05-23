import puppeteer from "puppeteer";

import candidates from "./candidates.json" assert { type: "json" };
import areas from "./areas.json" assert { type: "json" };

const urls = [...candidates, ...areas];

(async () => {
	// Launch the browser
	const browser = await puppeteer.launch();

	// Iterate over the URLs
	for (const element of urls) {
		const url = element;
		const page = await browser.newPage();

		// Set the viewport to 1200px wide
		await page.setViewport({
			width: 1200,
			height: 800, // Initial height; it will be adjusted automatically for fullPage screenshot
		});

		await page.goto(url);

		// hide the cookies div
		await page.evaluate(() => {
			const cookiesDiv = document.querySelector(".tcm-cookie-banner");
			if (cookiesDiv) {
				cookiesDiv.style.display = "none";
			}
		});

		// get the title of the page
		const title = await page.title();

		// Take a full-page screenshot and save it to a file
		const screenshotPath = `screenshots/${title}.png`;
		await page.screenshot({ path: screenshotPath, fullPage: true });
		console.log(`Screenshot of ${url} saved as ${screenshotPath}`);

		await page.close();
	}

	await browser.close();
})();
