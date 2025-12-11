// Node.js yerleşik fetch kullanıyoruz (Ekstra kurulum gerektirmez)
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

        // 1. MAÇLAR (ESPN)
        if (type === 'scoreboard') {
            let dateParam = '';
            if (date) {
                const d = new Date(date);
                // Ay ve Gün tek haneli ise başına 0 ekle
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                dateParam = `?dates=${yyyy}${mm}${dd}`;
            }
            apiUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard${dateParam}`;
        }
        
        // 2. BOX SCORE (ESPN)
        else if (type === 'boxscore') {
            apiUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;
        }
        
        // 3. İSTATİSTİKLER (NBA CDN - En Güvenlisi)
        else if (type === 'stats') {
            apiUrl = 'https://cdn.nba.com/static/json/liveData/playerstats/allplayers.json';
        }
        
        // 4. HABERLER (ESPN)
        else if (type === 'news') {
            apiUrl = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/news';
        }

        if (!apiUrl) return res.status(400).json({ error: 'Gecersiz istek' });

        // Native Fetch Kullanımı
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API Hatasi: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: 'Sunucu Hatasi', details: error.message });
    }
};
