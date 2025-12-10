const axios = require('axios');

module.exports = async (req, res) => {
    const { type, date } = req.query;

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

        // 1. MAÇLAR (SCOREBOARD)
        if (type === 'scoreboard') {
            // Tarih formatı: YYYYMMDD (ESPN formatı)
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
        
        // 2. HABERLER (NEWS)
        else if (type === 'news') {
            apiUrl = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/news';
        }

        // 3. SAKATLIKLAR (INJURIES) - Takım takım çekeceğiz
        else if (type === 'injuries') {
            // ESPN'den tüm takımların sakatlık listesini çeken özel bir endpoint yok,
            // bu yüzden ligin genel haber akışından veya scoreboard'dan sakatlıkları ayıklayacağız.
            // Şimdilik scoreboard verisi içindeki sakatlıkları kullanacağız.
            apiUrl = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'; 
        }

        if (!apiUrl) return res.status(400).json({ error: 'Gecersiz istek' });

        const response = await axios.get(apiUrl);
        res.status(200).json(response.data);

    } catch (error) {
        console.error("ESPN API Error:", error.message);
        res.status(500).json({ error: 'Veri alinamadi', details: error.message });
    }
};
