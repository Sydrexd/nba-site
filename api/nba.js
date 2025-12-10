const axios = require('axios');

module.exports = async (req, res) => {
    const { type, date, gameId } = req.query;

    // CORS Ayarları
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        let apiUrl = '';
        let isEspn = false;

        // 1. MAÇLAR (SCOREBOARD)
        if (type === 'scoreboard') {
            // Tarih seçimi varsa ESPN kullan (Tarih formatı YYYYMMDD)
            // Tarih yoksa (Bugün) NBA CDN kullan (Daha hızlı)
            const today = new Date().toISOString().split('T')[0];
            
            if (date && date !== today) {
                // Geçmiş Maçlar (ESPN)
                const d = new Date(date);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                apiUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${yyyy}${mm}${dd}`;
                isEspn = true;
            } else {
                // Bugünün Maçları (NBA CDN)
                apiUrl = 'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json';
            }
        }
        
        // 2. MAÇ DETAYI (BOX SCORE) - NBA CDN
        else if (type === 'details') {
            // Box Score için NBA CDN en iyisidir
            apiUrl = `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_${gameId}.json`;
        }
        
        // 3. HABERLER - ESPN
        else if (type === 'news') {
            apiUrl = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/news';
        }

        // 4. İSTATİSTİKLER - ESPN (Daha erişilebilir)
        else if (type === 'stats') {
            apiUrl = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/athletes?region=us&lang=en&contentorigin=espn&isqualified=true&page=1&limit=5&sort=offensive.avgPoints%3Adesc';
        }

        if (!apiUrl) return res.status(400).json({ error: 'Gecersiz istek' });

        const response = await axios.get(apiUrl);
        
        // Yanıtı işaretle (Frontend hangi yapıyı kullanacağını bilsin)
        const data = response.data;
        if(isEspn) data._source = 'espn';
        
        res.status(200).json(data);

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ error: 'Veri alinamadi', details: error.message });
    }
};
