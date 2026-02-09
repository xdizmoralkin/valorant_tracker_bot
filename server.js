const express = require("express");
const axios = require("axios");

const app = express();

app.get("/", (req, res) => {
  res.type("text").send("OK. Use /rank?riot=Name#TAG");
});

function splitRiotId(riot) {
  const s = (riot || "").trim();
  const i = s.lastIndexOf("#");
  if (i === -1) return { name: s, tag: "" };
  return { name: s.slice(0, i), tag: s.slice(i + 1) };
}

app.get("/rank", async (req, res) => {
  try {
    const region = (req.query.region || "eu").toLowerCase();
    const riotRaw = (req.query.riot || "no friends#6479").trim();
    const { name, tag } = splitRiotId(riotRaw);

    if (!name || !tag) {
      return res
        .status(400)
        .type("text")
        .send("Формат: /rank?riot=Name#TAG");
    }

    const url =
      `https://api.henrikdev.xyz/valorant/v2/mmr/` +
      `${encodeURIComponent(region)}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}` +
      `?platform=pc`;

    const r = await axios.get(url, { timeout: 15000 });
    const j = r.data;

    // v2 обычно кладёт текущие данные в data.current_data.*
    const cur = j?.data?.current_data || j?.data || {};
    const rank = cur.currenttierpatched || cur.currenttier_patched;
    const rr = cur.ranking_in_tier;

    // peak/пик: структура может отличаться, поэтому берём максимально безопасно
    const hr = j?.data?.highest_rank || {};
    const peak =
      hr.patched_tier || hr.currenttierpatched || hr.currenttier_patched || hr.patched || "";

    if (!rank) {
      return res.status(502).type("text").send("Нет данных о ранге (профиль/регион/лимиты).");
    }

    let out = `RANK: ${rank}`;
    if (Number.isFinite(rr)) out += ` | RR: ${rr}`;
    if (peak) out += ` | PEAK: ${peak}`;

    res.type("text").send(out.slice(0, 390));
  } catch (e) {
    res.status(502).type("text").send("Ошибка получения ранга.");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));


