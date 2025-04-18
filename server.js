import express from "express";
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const OSOBY_URL = "https://letsplay.ag3nts.org/data/osoby.json";
const BADANIA_URL = "https://letsplay.ag3nts.org/data/badania.json";
const UCZELNIE_URL = "https://letsplay.ag3nts.org/data/uczelnie.json";

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Could not fetch data from ${url}:`, error);
    return null;
  }
}

app.post("/tool_badania", async (req, res) => {
  console.log("Received request for /tool_badania:", req.body);
  const inputData = req.body.input;

  if (typeof inputData === "string" && inputData.startsWith("test")) {
    console.log("Responding to test request for /tool_badania");
    return res.json({ output: inputData });
  }

  const searchTerm =
    typeof inputData === "string" ? inputData.toLowerCase() : "";
  if (!searchTerm) {
    return res.status(400).json({ error: "Missing search term in input" });
  }

  try {
    const [badania, uczelnie] = await Promise.all([
      fetchData(BADANIA_URL),
      fetchData(UCZELNIE_URL),
    ]);

    if (!badania || !uczelnie) {
      throw new Error("Failed to fetch source data for tool_badania");
    }

    const znalezioneBadanie = badania.find((b) =>
      b.nazwa.toLowerCase().includes(searchTerm)
    );

    if (!znalezioneBadanie) {
      console.log(`No study found containing '${searchTerm}'`);
      return res.json({ output: JSON.stringify({}) });
    }

    const uczelniaId = znalezioneBadanie.uczelnia;
    const sponsor = znalezioneBadanie.sponsor;

    const znalezionaUczelnia = uczelnie.find((u) => u.id === uczelniaId);
    const uczelniaNazwa = znalezionaUczelnia
      ? znalezionaUczelnia.nazwa
      : "Nieznana Uczelnia";

    const result = {
      uczelnia_id: uczelniaId,
      uczelnia_nazwa: uczelniaNazwa,
      sponsor: sponsor,
    };

    console.log("Responding from /tool_badania with:", result);
    res.json({ output: JSON.stringify(result) });
  } catch (error) {
    console.error("Error in /tool_badania:", error);
    res.status(500).json({ error: "Internal Server Error in tool_badania" });
  }
});

app.post("/tool_osoby", async (req, res) => {
  console.log("Received request for /tool_osoby:", req.body);
  const inputData = req.body.input;

  if (typeof inputData === "string" && inputData.startsWith("test")) {
    console.log("Responding to test request for /tool_osoby");
    return res.json({ output: inputData });
  }

  const uczelniaId = typeof inputData === "string" ? inputData : "";
  if (!uczelniaId) {
    return res.status(400).json({ error: "Missing university ID in input" });
  }

  try {
    const osoby = await fetchData(OSOBY_URL);

    if (!osoby) {
      throw new Error("Failed to fetch source data for tool_osoby");
    }

    const czlonkowieZespolu = osoby
      .filter((o) => o.uczelnia === uczelniaId)
      .map((o) => `${o.imie} ${o.nazwisko}`);

    const result = {
      czlonkowie: czlonkowieZespolu,
    };

    console.log("Responding from /tool_osoby with:", result);
    res.json({ output: JSON.stringify(result) });
  } catch (error) {
    console.error("Error in /tool_osoby:", error);
    res.status(500).json({ error: "Internal Server Error in tool_osoby" });
  }
});

app.get("/", (req, res) => {
  res.send("AI Agent Tools Webhooks are running!");
});

export default app;
