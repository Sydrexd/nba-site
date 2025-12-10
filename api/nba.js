const axios = require('axios');

module.exports = async (req, res) => {
    const { type, date, gameId } = req.query;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        let apiUrl = '';

        // 1. MAÇLAR (ESPN SCOREBOARD)
        if (type === 'scoreboard') {
            let dateParam = '';
            if (date) {
                const d = new Date(date);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                dateParam = `?dates=${yyyy}${mm}${dd}`;
            }
            apiUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard${dateParam}`;
        }
        
        // 2. BOX SCORE (ESPN SUMMARY)
        else if (type === 'boxscore') {
            apiUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;
        }
        
        // 3. İSTATİSTİKLER (NBA HOMEPAGE DATA - DAHA STABİL)
        else if (type === 'stats') {
            // ESPN Web API yerine NBA'in statik JSON dosyasını kullanıyoruz (Bot koruması düşüktür)
            apiUrl = 'https://stats.nba.com/js/data/widgets/home_season_leaders.json';
        }
        
        // 4. HABERLER (ESPN)
        else if (type === 'news') {
            apiUrl = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/news';
        }

        if (!apiUrl) return res.status(400).json({ error: 'Gecersiz istek' });

        // NBA endpointleri için özel header
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://www.nba.com/'
        };

        const response = await axios.get(apiUrl, { headers });
        res.status(200).json(response.data);

    } catch (error) {
        console.error("API Hatası:", error.message);
        res.status(500).json({ error: 'API Error', details: error.message });
    }
};
