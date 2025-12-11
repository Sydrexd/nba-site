const axios = require('axios');

module.exports = async (req, res) => {
    const { type, date, gameId, category } = req.query;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        let apiUrl = '';

        // 1. MAÇLAR (SCOREBOARD)
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
        
        // 2. BOX SCORE (SUMMARY)
        else if (type === 'boxscore') {
            apiUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;
        }
        
        // 3. İSTATİSTİKLER (ESPN - ENGELLENMEZ)
        else if (type === 'stats') {
            // ESPN'in kendi sitesinde kullandığı endpoint
            apiUrl = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/athletes?region=us&lang=en&contentorigin=espn&isqualified=true&page=1&limit=20&sort=offensive.avgPoints%3Adesc';
        }
        
        // 4. HABERLER
        else if (type === 'news') {
            apiUrl = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/news';
        }

        if (!apiUrl) return res.status(400).json({ error: 'Gecersiz istek' });

        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json'
            },
            timeout: 5000 // 5 saniye bekle, gelmezse kapat
        });

        res.status(200).json(response.data);

    } catch (error) {
        console.error("Backend Error:", error.message);
        // Hata olsa bile 200 dön ve boş veri ver ki frontend çökmesin
        res.status(200).json({ error: true, message: error.message });
    }
};
