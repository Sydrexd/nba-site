const axios = require('axios');

module.exports = async (req, res) => {
    const { type, category } = req.query;

    // CORS İzinleri
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        let url = '';
        let isXML = false; // Haberler XML formatında gelecek

        if (type === 'scoreboard') {
            url = 'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json';
        } 
        else if (type === 'stats') {
            const statType = category || 'PTS';
            url = `https://stats.nba.com/stats/leagueleaders?LeagueID=00&PerMode=PerGame&Scope=S&Season=2023-24&SeasonType=Regular%20Season&StatCategory=${statType}`;
        }
        else if (type === 'news') {
            // ESPN RSS Feed (En stabil ve ücretsiz haber kaynağı)
            url = 'https://www.espn.com/espn/rss/nba/news';
            isXML = true;
        }
        // Sakatlıklar için de ESPN RSS kullanılabilir veya mock kalabilir
        else if (type === 'injuries') {
             return res.status(200).json([
                { name: "Ja Morant", team: "MEM", status: "Out", type: "Shoulder", return: "Season" },
                { name: "Joel Embiid", team: "PHI", status: "Day-to-Day", type: "Knee", return: "Questionable" },
                { name: "Trae Young", team: "ATL", status: "Out", type: "Finger", return: "Weeks" }
             ]);
        }

        if (!url) return res.status(400).json({ error: 'Gecersiz istek' });

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0' // ESPN botları engellemesin diye
            }
        });

        // Eğer Haber çekiyorsak (XML), veriyi olduğu gibi text olarak yolla
        if (isXML) {
            res.setHeader('Content-Type', 'text/xml');
            res.status(200).send(response.data);
        } else {
            res.status(200).json(response.data);
        }

    } catch (error) {
        console.error("API Hatası:", error.message);
        res.status(500).json({ error: 'Veri Cekilemedi', details: error.message });
    }
};
