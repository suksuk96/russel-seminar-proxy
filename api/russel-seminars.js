// [우석 추가] 러셀 설명회 페이지를 크롤링해서 JSON으로 반환하는 Vercel API

import cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const targetUrl =
      "https://russeldc.megastudy.net/russel/entinfo/entry_pt/enter_pt_list.asp";

    const response = await fetch(targetUrl);
    const buffer = await response.arrayBuffer();

    const text = new TextDecoder("euc-kr", { fatal: false }).decode(buffer);

    const $ = cheerio.load(text);

    const result = [];

    $("table tbody tr").each((i, el) => {
      const tds = $(el).find("td");
      if (tds.length < 5) return;

      const grade = $(tds[1]).text().replace(/\s+/g, " ").trim();
      const title = $(tds[2]).text().replace(/\s+/g, " ").trim();
      const dateText = $(tds[3]).text().replace(/\s+/g, " ").trim();
      const place = $(tds[4]).text().replace(/\s+/g, " ").trim();

      let dateISO = "";
      const match = dateText.match(/(\d{4}-\d{2}-\d{2})/);
      if (match) dateISO = match[1];

      result.push({
        grade,
        title,
        dateText,
        date: dateISO,
        place
      });
    });

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed_to_fetch_or_parse" });
  }
}
