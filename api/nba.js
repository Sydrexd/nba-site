const axios = require('axios');

module.exports = async (req, res) => {
    const { type, category } = req.query;

    // CORS Ayarları (Sitenin veriye erişebilmesi için izinler)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Tarayıcı ön kontrol (OPTIONS) isteği atarsa "Tamam" de
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        let url = '';
        
        // 1. CANLI SKORLAR
        if (type === 'scoreboard') {
            url = 'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json';
        } 
        // 2. İSTATİSTİKLER
        else if (type === 'stats') {
            const statType = category || 'PTS';
            url = `https://stats.nba.com/stats/leagueleaders?LeagueID=00&PerMode=PerGame&Scope=S&Season=2023-24&SeasonType=Regular%20Season&StatCategory=${statType}`;
        }
        // 3. SAKATLIKLAR (Manuel Yedek Veri)
        else if (type === 'injuries') {
             return res.status(200).json([
                { name: "Ja Morant", team: "MEM", status: "Out", type: "Shoulder", return: "Season" },
                { name: "Joel Embiid", team: "PHI", status: "Day-to-Day", type: "Knee", return: "Questionable" },
                { name: "Luka Doncic", team: "DAL", status: "Day-to-Day", type: "Ankle", return: "Probable" }
             ]);
        }

        if (!url) {
            return res.status(400).json({ error: 'Gecersiz istek turu' });
        }

        // NBA Sunucusuna İstek At
        const response = await axios.get(url, {
            headers: {
                'Referer': 'https://www.nba.com/',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        res.status(200).json(response.data);

    } catch (error) {
        console.error("Hata Detayi:", error.message);
        res.status(500).json({ error: 'Veri cekilemedi', details: error.message });
    }
};
