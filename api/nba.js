const axios = require('axios');

module.exports = async (req, res) => {
    const { type, date, gameId, category } = req.query;

    // CORS ve Header Ayarları
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // NBA Stats API için Gerekli Headerlar (Taklit)
    const headers = {
        'Referer': 'https://www.nba.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Origin': 'https://www.nba.com',
        'Connection': 'keep-alive'
    };

    try {
        let url = '';
        
        // 1. MAÇ LİSTESİ (Tarihe Göre)
        if (type === 'scoreboard') {
            // Tarih formatı: YYYY-MM-DD -> NBA formatına çevir (MM/DD/YYYY)
            // Eğer tarih yoksa bugünü al
            let dateParam = new Date();
            if (date) dateParam = new Date(date);
            
            const mm = String(dateParam.getMonth() + 1).padStart(2, '0');
            const dd = String(dateParam.getDate()).padStart(2, '0');
            const yyyy = dateParam.getFullYear();
            const nbaDate = `${mm}/${dd}/${yyyy}`;

            url = `https://stats.nba.com/stats/scoreboardv2?DayOffset=0&LeagueID=00&GameDate=${nbaDate}`;
        }
        // 2. MAÇ DETAYI (Box Score)
        else if (type === 'details') {
            url = `https://stats.nba.com/stats/boxscoretraditionalv2?GameID=${gameId}&RangeType=0&StartPeriod=0&EndPeriod=0&StartRange=0&EndRange=0`;
        }
        // 3. İSTATİSTİKLER (Liderler)
        else if (type === 'stats') {
            const cat = category || 'PTS';
            url = `https://stats.nba.com/stats/leagueleaders?LeagueID=00&PerMode=PerGame&Scope=S&Season=2023-24&SeasonType=Regular%20Season&StatCategory=${cat}`;
        }
        // 4. TAKIM SIRALAMASI (Odds Hesaplamak İçin)
        else if (type === 'standings') {
            url = `https://stats.nba.com/stats/leaguestandings?LeagueID=00&Season=2023-24&SeasonType=Regular%20Season`;
        }
        // 5. HABERLER (ESPN RSS)
        else if (type === 'news') {
            const rss = await axios.get('https://www.espn.com/espn/rss/nba/news');
            res.setHeader('Content-Type', 'text/xml');
            return res.status(200).send(rss.data);
        }

        if (!url) return res.status(400).json({ error: 'Gecersiz istek' });

        const response = await axios.get(url, { headers });
        res.status(200).json(response.data);

    } catch (error) {
        console.error("API Hatası:", error.message);
        res.status(500).json({ error: 'Veri Cekilemedi', details: error.message });
    }
};
