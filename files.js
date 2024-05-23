import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs-extra";
import path from "path";
import pages from "./pages.json" assert { type: "json" };

const downloadFolder = "./pdfs";

// Ensure download folder exists
if (!fs.existsSync(downloadFolder)) {
	fs.mkdirSync(downloadFolder, { recursive: true });
}

const downloadFile = async (url) => {
	try {
		const response = await axios.get(url, { responseType: "stream" });
		const filename = path.basename(url);
		const filePath = path.join(downloadFolder, filename);

		response.data.pipe(fs.createWriteStream(filePath));

		response.data.on("end", () => {
			console.log(`Downloaded: ${filename}`);
		});

		response.data.on("error", (err) => {
			console.error(`Error downloading ${filename}: ${err}`);
		});
	} catch (error) {
		console.error(`Failed to download from ${url}: ${error.message}`);
	}
};

const extractAndDownloadFiles = async (pageUrl) => {
	try {
		const response = await axios.get(pageUrl);
		const $ = cheerio.load(response.data);

		// Modify the selector based on where the links are in the DOM
		$('[href$=".mp3"]').each((index, element) => {
			const pdfUrl = $(element).attr("href");
			if (pdfUrl) {
				const fullUrl = new URL(pdfUrl, pageUrl).href;
				downloadFile(fullUrl);
			}
		});
	} catch (error) {
		console.error(`Failed to fetch page ${pageUrl}: ${error.message}`);
	}
};

const processAllPages = async () => {
	for (const pageUrl of pages) {
		await extractAndDownloadFiles(pageUrl);
	}
};

processAllPages();
