const axios = require('axios');

module.exports = async (req, res) => {
    const { type, date, gameId, category } = req.query;

    // CORS İzinleri
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
            // Tarih seçilmişse
            if (date) {
                const d = new Date(date);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                dateParam = `?dates=${yyyy}${mm}${dd}`;
            }
            apiUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard${dateParam}`;
        }
        
        // 2. MAÇ DETAYI (BOX SCORE - SUMMARY ENDPOINT)
        else if (type === 'boxscore') {
            // Bu endpoint hem skorları, hem play-by-play hem de boxscore'u verir.
            apiUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;
        }
        
        // 3. İSTATİSTİKLER (STATS LEADERS)
        else if (type === 'stats') {
            // ESPN Web API - Sezonluk Liderler
            apiUrl = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/athletes?region=us&lang=en&contentorigin=espn&isqualified=true&page=1&limit=10&sort=offensive.avgPoints%3Adesc';
        }
        
        // 4. HABERLER (NEWS)
        else if (type === 'news') {
            apiUrl = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/news';
        }

        if (!apiUrl) return res.status(400).json({ error: 'Gecersiz istek' });

        const response = await axios.get(apiUrl);
        res.status(200).json(response.data);

    } catch (error) {
        // Hata detayını console'a yaz ama kullanıcıya temiz JSON dön
        console.error("API Error:", error.message);
        res.status(500).json({ error: 'Veri cekilemedi', details: error.message });
    }
};
