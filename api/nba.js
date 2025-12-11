const axios = require('axios');

module.exports = async (req, res) => {
    const { type, date, gameId } = req.query;

    // CORS: Her yerden erişime izin ver
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        let targetUrl = '';

        // 1. MAÇLAR (Scoreboard)
        if (type === 'scoreboard') {
            // Tarih varsa YYYYMMDD formatına çevir
            let dateStr = '';
            if (date) {
                const d = new Date(date);
                // Ay ve Gün tek haneli ise başına 0 ekle
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                dateStr = `?dates=${yyyy}${mm}${dd}`;
            }
            targetUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard${dateStr}`;
        }
        
        // 2. DETAYLAR (Box Score)
        else if (type === 'boxscore') {
            targetUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;
        }
        
        // 3. İSTATİSTİKLER (Stats)
        else if (type === 'stats') {
            targetUrl = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/athletes?region=us&lang=en&contentorigin=espn&isqualified=true&page=1&limit=20&sort=offensive.avgPoints%3Adesc';
        }
        
        // 4. HABERLER (News)
        else if (type === 'news') {
            targetUrl = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/news';
        }

        if (!targetUrl) return res.status(400).json({ error: 'Gecersiz Istek' });

        // ESPN'e istek at
        const response = await axios.get(targetUrl);
        
        // Başarılı veriyi döndür
        res.status(200).json(response.data);

    } catch (error) {
        // Hata olsa bile 200 dön ama içi boş olsun (Site çökmesin diye)
        console.error("API Error:", error.message);
        res.status(200).json({ error: true, message: error.message });
    }
};
