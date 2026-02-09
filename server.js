const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

const TRACKER_URL = "https://tracker.gg/valorant/profile/riot/no%20friends%236479/overview";

app.get("/rank", async (req, res) => {
    try {
        const { data } = await axios.get(TRACKER_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const $ = cheerio.load(data);

        // Ранг
        const rank = $(".rank-name").first().text().trim();

        // RR
        const rr = $(".rank-rr").first().text().trim();

        // Топ %
        const top = $(".rank-top").first().text().trim();

        if (!rank) {
            return res.send("Не удалось получить ранг с трекера");
        }

        let response = `Мой ранг в Valorant: ${rank}`;

        if (rr) response += ` — ${rr}`;
        if (top) response += ` — ${top}`;

        res.send(response);

    } catch (e) {
        res.send("Ошибка получения ранга");
    }
});

app.listen(3000, () => console.log("Server started on port 3000"));
