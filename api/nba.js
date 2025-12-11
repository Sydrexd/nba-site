const axios = require('axios');

module.exports = async (req, res) => {
    const { type, date, gameId, lang } = req.query;

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
        
        // 3. İSTATİSTİKLER (ESPN WEB API - YENİ VE SAĞLAM KAYNAK)
        else if (type === 'stats') {
            // Bu link ESPN web sitesinin kullandığı public API'dir.
            apiUrl = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/athletes?region=us&lang=en&contentorigin=espn&isqualified=true&page=1&limit=20&sort=offensive.avgPoints%3Adesc';
        }
        
        // 4. HABERLER (ESPN)
        else if (type === 'news') {
            apiUrl = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/news';
        }

        if (!apiUrl) return res.status(400).json({ error: 'Gecersiz istek' });

        const response = await axios.get(apiUrl);
        res.status(200).json(response.data);

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ error: 'Veri alinamadi', details: error.message });
    }
};
