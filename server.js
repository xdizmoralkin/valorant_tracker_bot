const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

app.get("/", (req, res) => {
  res.type("text").send("OK. Use /rank or /rank?riot=Name#TAG");
});

app.get("/rank", async (req, res) => {
  try {
    const riotRaw = (req.query.riot || "no friends#6479").trim();
    const riotEnc = encodeURIComponent(riotRaw);

    const url = `https://tracker.gg/valorant/profile/riot/${riotEnc}/overview?platform=pc&playlist=competitive`;

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);

    const rank = $(".rank-name").first().text().trim();
    const rr = $(".rank-rr").first().text().trim();
    const top = $(".rank-top").first().text().trim();

    if (!rank) {
      return res
        .status(502)
        .type("text")
        .send("Не удалось получить ранг (страница изменилась/защита).");
    }

    let response = `RANK: ${rank}`;
    if (rr) response += ` | RR: ${rr}`;
    if (top) response += ` | PEAK/TOP: ${top}`;

    res.type("text").send(response.slice(0, 390));
  } catch (e) {
    res.status(502).type("text").send("Ошибка получения ранга.");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
