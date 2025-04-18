const fetch = require('node-fetch');
const UCZELNIE_URL = 'https://letsplay.ag3nts.org/data/uczelnie.json';
const OSOBY_URL = 'https://letsplay.ag3nts.org/data/osoby.json';

module.exports = async (req, res) => {
  const input = req.body.input;
  if (input.startsWith('test')) {
    return res.json({ output: input });
  }
  const uczelnie = await fetch(UCZELNIE_URL).then(res => res.json());
  const osoby = await fetch(OSOBY_URL).then(res => res.json());
  const universityCode = input;
  const university = uczelnie.find(u => u.id === universityCode);
  if (!university) {
    return res.json({ output: { error: 'University not found' } });
  }
  const people = osoby.filter(p => p.uczelnia === universityCode).map(p => `${p.imie} ${p.nazwisko}`);
  res.json({ output: { university: university.nazwa, people } });
};