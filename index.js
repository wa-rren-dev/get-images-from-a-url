import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs-extra";
import path from "path";
import { image } from "image-downloader";
import urls from "./urls.json" assert { type: "json" };

const delayBetweenRequests = 1000;
const selector = ".sidebar > img";
const folderPath = "./downloaded-images";

let unsuccessfulUrls = [];

async function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function downloadImage(url, folderPath, selector) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const pageTitle = $("title").text();
    const safeTitle = pageTitle.replace(/[^a-zA-Z0-9]/g, "_");

    const imageUrl = $(selector).attr("src");

    if (imageUrl) {
      fs.ensureDirSync(folderPath);

      const imageExtension = imageUrl.split(".").pop().split("?")[0];
      const filename = `${safeTitle}.${imageExtension}`;

      await delay(delayBetweenRequests);

      const options = {
        url: imageUrl.startsWith("http")
          ? imageUrl
          : new URL(imageUrl, url).toString(),
        dest: path.resolve(folderPath, filename),
      };

      const { filename: savedFilename } = await image(options);
      console.log(`Image saved to ${savedFilename}`);
    } else {
      throw new Error("Image not found for the provided selector.");
    }
  } catch (e) {
    console.error("Error processing URL: ", url, e.message);
    unsuccessfulUrls.push(url);
  }
}

(async function processUrls() {
  for (const url of urls) {
    await downloadImage(url, folderPath, selector).catch((e) =>
      console.error(e),
    );
  }

  if (unsuccessfulUrls.length > 0) {
    console.log("The following URLs were not processed successfully:");
    unsuccessfulUrls.forEach((url) => console.log(url));
  } else {
    console.log("All URLs were processed successfully.");
  }
})();
