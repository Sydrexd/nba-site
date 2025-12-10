const axios = require('axios');

module.exports = async (req, res) => {
    const { type, date, gameId, category } = req.query;

    // CORS İzinleri (Her yerden erişim)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // NBA API için Gerekli Headerlar
    const nbaHeaders = {
        'Referer': 'https://www.nba.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Origin': 'https://www.nba.com',
        'x-nba-stats-origin': 'stats',
        'x-nba-stats-token': 'true'
    };

    try {
        let url = '';
        
        // 1. MAÇ LİSTESİ (Scoreboard)
        if (type === 'scoreboard') {
            // Tarih kontrolü ve formatlama (YYYY-MM-DD -> MM/DD/YYYY)
            let targetDate = new Date();
            if (date && date !== 'undefined') {
                targetDate = new Date(date);
            }

            const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
            const dd = String(targetDate.getDate()).padStart(2, '0');
            const yyyy = targetDate.getFullYear();
            const formattedDate = `${mm}/${dd}/${yyyy}`;

            // scoreboardv2 endpointi en stabil olanıdır
            url = `https://stats.nba.com/stats/scoreboardv2?DayOffset=0&LeagueID=00&GameDate=${formattedDate}`;
        }
        
        // 2. MAÇ DETAYI (Box Score)
        else if (type === 'details') {
            if(!gameId) return res.status(400).json({ error: 'GameID eksik' });
            url = `https://stats.nba.com/stats/boxscoretraditionalv2?GameID=${gameId}&RangeType=0&StartPeriod=0&EndPeriod=0&StartRange=0&EndRange=0`;
        }
        
        // 3. İSTATİSTİKLER (Liderler)
        else if (type === 'stats') {
            const cat = category || 'PTS';
            url = `https://stats.nba.com/stats/leagueleaders?LeagueID=00&PerMode=PerGame&Scope=S&Season=2024-25&SeasonType=Regular%20Season&StatCategory=${cat}`;
        }
        
        // 4. HABERLER (ESPN RSS)
        else if (type === 'news') {
            const rss = await axios.get('https://www.espn.com/espn/rss/nba/news');
            res.setHeader('Content-Type', 'text/xml');
            return res.status(200).send(rss.data);
        }
        
        // 5. SAKATLIKLAR (Manuel/Mock Veri - Ücretsiz API olmadığı için)
        else if (type === 'injuries') {
             return res.status(200).json([
                { name: "Ja Morant", team: "MEM", status: "Out", type: "Shoulder", return: "Season" },
                { name: "Joel Embiid", team: "PHI", status: "Day-to-Day", type: "Knee", return: "Questionable" },
                { name: "Luka Doncic", team: "DAL", status: "Day-to-Day", type: "Ankle", return: "Probable" },
                { name: "Trae Young", team: "ATL", status: "Out", type: "Finger", return: "Weeks" }
             ]);
        }

        if (!url) return res.status(400).json({ error: 'Gecersiz istek' });

        const response = await axios.get(url, { headers: nbaHeaders });
        res.status(200).json(response.data);

    } catch (error) {
        console.error("API Hatası:", error.message);
        res.status(500).json({ error: 'Veri Cekilemedi', details: error.message });
    }
};
