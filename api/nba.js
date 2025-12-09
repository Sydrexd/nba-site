// Bu dosya sunucuda çalışır, veriyi NBA'den çeker sana verir.
const axios = require('axios');

export default async function handler(req, res) {
  // NBA'in resmi (gizli olmayan) veri endpointleri
  const endpoints = {
    stats: 'https://stats.nba.com/stats/leagueleaders?LeagueID=00&PerMode=PerGame&Scope=S&Season=2023-24&SeasonType=Regular%20Season&StatCategory=PTS',
    scoreboard: 'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json'
  };

  const { type } = req.query; // site.com/api/nba?type=stats diye çağıracağız

  if (!endpoints[type]) {
    return res.status(400).json({ error: 'Gecersiz istek turu' });
  }

  try {
    // NBA sunucusuna sanki bir tarayıcıymışız gibi istek atıyoruz (Referer taktiği)
    const response = await axios.get(endpoints[type], {
      headers: {
        'Referer': 'https://www.nba.com/',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    // Veriyi olduğu gibi senin siteye yolluyoruz
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Veri cekilemedi', details: error.message });
  }
}