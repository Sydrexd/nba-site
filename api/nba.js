const axios = require('axios');

module.exports = async (req, res) => {
    const { type, date, gameId } = req.query;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        let apiUrl = '';

        if (type === 'scoreboard') {
            // ESPN Scoreboard
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
        else if (type === 'boxscore') {
            // ESPN Summary
            apiUrl = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;
        }
        else if (type === 'stats') {
            // NBA Homepage Widget Data (En garantisi bu)
            apiUrl = 'https://stats.nba.com/js/data/widgets/home_season_leaders.json';
        }
        else if (type === 'news') {
            apiUrl = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/news';
        }

        if (!apiUrl) return res.status(400).json({ error: 'Gecersiz istek' });

        const response = await axios.get(apiUrl, {
            headers: {
                // NBA sitesini taklit eden headerlar (403 yememek için)
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.nba.com/',
                'Origin': 'https://www.nba.com'
            }
        });
        
        res.status(200).json(response.data);

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ error: 'Veri alinamadi', details: error.message });
    }
};
