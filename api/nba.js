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
        const config = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 10000
        };

        // 1. GAMES (SCOREBOARD) -> ESPN
        if (type === 'scoreboard') {
            let dateParam = '';
            if (date) {
                const d = new Date(date + 'T12:00:00');
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                dateParam = `?dates=${yyyy}${mm}${dd}`;
            }
            apiUrl = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard${dateParam}`;
        }
        
        // 2. BOX SCORE -> ESPN
        else if (type === 'boxscore') {
            if (!gameId) {
                return res.status(400).json({ error: 'gameId required' });
            }
            apiUrl = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;
        }
        
        // 3. STATISTICS -> Try multiple sources with fallbacks
        else if (type === 'stats') {
            // Try ESPN leaders first (most reliable)
            try {
                console.log('Trying ESPN leaders API...');
                apiUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/leaders';
                const response = await axios.get(apiUrl, config);
                console.log('ESPN leaders API successful');
                return res.status(200).json(response.data);
            } catch (err1) {
                console.log('ESPN leaders failed, trying NBA CDN...');
                
                // Fallback to NBA CDN
                try {
                    apiUrl = 'https://cdn.nba.com/static/json/liveData/playerstats/allplayers.json';
                    const response = await axios.get(apiUrl, config);
                    console.log('NBA CDN successful');
                    return res.status(200).json(response.data);
                } catch (err2) {
                    console.log('NBA CDN failed, trying stats.nba.com...');
                    
                    // Last resort - try stats.nba.com
                    try {
                        apiUrl = 'https://stats.nba.com/stats/leagueLeaders?LeagueID=00&PerMode=PerGame&Scope=S&Season=2024-25&SeasonType=Regular+Season&StatCategory=PTS';
                        const response = await axios.get(apiUrl, {
                            ...config,
                            headers: {
                                ...config.headers,
                                'Referer': 'https://www.nba.com/',
                                'Origin': 'https://www.nba.com'
                            }
                        });
                        console.log('stats.nba.com successful');
                        return res.status(200).json(response.data);
                    } catch (err3) {
                        console.error('All stats sources failed');
                        throw new Error('All stats API sources unavailable');
                    }
                }
            }
        }
        
        // 4. NEWS -> ESPN JSON API
        else if (type === 'news') {
            apiUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news';
        }

        if (!apiUrl) {
            return res.status(400).json({ error: 'Invalid request type' });
        }

        const response = await axios.get(apiUrl, config);
        console.log(`✓ ${type} API call successful`);
        res.status(200).json(response.data);

    } catch (error) {
        console.error(`✗ API Error [${type}]:`, error.message);
        
        const errorResponse = {
            error: 'Data fetch failed',
            type: type,
            details: error.message,
            statusCode: error.response?.status,
            timestamp: new Date().toISOString()
        };
        
        res.status(error.response?.status || 500).json(errorResponse);
    }
};
