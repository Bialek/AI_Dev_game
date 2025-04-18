const fetch = require("node-fetch");
const DATA_URL = "https://letsplay.ag3nts.org/data/badania.json";

module.exports = async (req, res) => {
  const input = req.body.input;
  if (input.startsWith("test")) {
    return res.json({ output: input });
  }
  const badania = await fetch(DATA_URL).then((res) => res.json());
  const keyword = input.toLowerCase();
  const matchingProjects = badania.filter((project) =>
    project.nazwa.toLowerCase().includes(keyword)
  );
  res.json({ output: matchingProjects });
};
