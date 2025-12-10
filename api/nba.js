const axios = require('axios');

module.exports = async (req, res) => {
    const { type, date, gameId, category, lang } = req.query;

    // CORS ve Header Ayarları
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // NBA API Headerları (Bloklanmayı önlemek için)
    const nbaHeaders = {
        'Referer': 'https://www.nba.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Origin': 'https://www.nba.com',
        'Accept': 'application/json',
        'Connection': 'keep-alive'
    };

    try {
        let url = '';
        let isXML = false;

        // 1. MAÇ LİSTESİ (Scoreboard)
        if (type === 'scoreboard') {
            // NBA'in CDN verisi (En hızlı ve engellenmez) - Bugün için
            // Tarih kontrolü yapılabilir ancak CDN yapısı karmaşık olduğu için
            // Şimdilik en stabil olan "Bugünün Skorbordu"nu kullanacağız.
            // Geçmiş maçlar için stats.nba.com fallback'i eklenebilir.
            
            // Eğer tarih bugünden farklıysa stats.nba.com dene (Riskli ama gerekli)
            const today = new Date().toISOString().split('T')[0];
            if (date && date !== today) {
                const d = new Date(date);
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                const yyyy = d.getFullYear();
                url = `https://stats.nba.com/stats/scoreboardv2?DayOffset=0&LeagueID=00&GameDate=${mm}/${dd}/${yyyy}`;
            } else {
                url = 'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json';
            }
        }
        
        // 2. MAÇ DETAYI (Box Score)
        else if (type === 'details') {
            // CDN Boxscore (Daha hızlı)
            url = `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_${gameId}.json`;
        }
        
        // 3. İSTATİSTİKLER (Liderler)
        else if (type === 'stats') {
            const cat = category || 'PTS';
            url = `https://stats.nba.com/stats/leagueleaders?LeagueID=00&PerMode=PerGame&Scope=S&Season=2024-25&SeasonType=Regular%20Season&StatCategory=${cat}`;
        }
        
        // 4. HABERLER (DİL DESTEĞİ EKLENDİ)
        else if (type === 'news') {
            isXML = true;
            if (lang === 'tr') {
                // Türkçe Kaynak (TrendBasket RSS)
                url = 'https://trendbasket.net/feed/'; 
            } else {
                // İngilizce Kaynak (NBA.com RSS veya ESPN)
                url = 'https://www.nba.com/feeds/rss/stories.xml'; 
            }
        }

        if (!url) return res.status(400).json({ error: 'Gecersiz istek' });

        const response = await axios.get(url, { headers: nbaHeaders });

        if (isXML) {
            res.setHeader('Content-Type', 'text/xml');
            return res.status(200).send(response.data);
        }

        res.status(200).json(response.data);

    } catch (error) {
        console.error(`API Hatası (${type}):`, error.message);
        // Hata durumunda boş JSON dön ki site çökmesin
        res.status(200).json({ error: true, message: error.message, resultSets: [] });
    }
};
