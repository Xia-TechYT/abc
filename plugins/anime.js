const axios = require('axios');
const anime = require('anime-heaven'); // This is already in your package.json

module.exports = {
    name: 'anime',
    alias: ['animesearch', 'weeb'],
    category: 'anime',
    desc: 'Search for anime',
    usage: '.anime <name>',
    react: '⛩️',
    
    async execute(sock, msg, args, extra) {
        const jid = msg.key.remoteJid;
        const query = args.join(' ');

        if (!query) {
            return await sock.sendMessage(jid, { text: '❌ Please provide an anime name.\nExample: `.anime One Piece`' }, { quoted: msg });
        }

        await sock.sendMessage(jid, { text: `🔍 Searching anime for: *${query}*...` }, { quoted: msg });

        try {
            // Note: Depending on the version of anime-heaven, the function might be anime.search() or something else.
            // Using a generic scraper fallback here to be safe.
            const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`);
            const data = res.data.data;

            if (!data || data.length === 0) {
                return await sock.sendMessage(jid, { text: '❌ No anime found with that name.' }, { quoted: msg });
            }

            let text = `⛩️ *Anime Search Results* ⛩️\n\n`;
            
            data.forEach((anime, index) => {
                text += `*${index + 1}. ${anime.title}*\n`;
                text += `⭐ Rating: ${anime.score || 'N/A'}\n`;
                text += `📺 Episodes: ${anime.episodes || 'Ongoing'}\n`;
                text += `📝 Synopsis: ${anime.synopsis ? anime.synopsis.substring(0, 100) + '...' : 'No synopsis'}\n\n`;
            });

            // Sends the image of the first anime result with the text
            await sock.sendMessage(jid, { 
                image: { url: data[0].images.jpg.image_url }, 
                caption: text 
            }, { quoted: msg });

        } catch (error) {
            console.error("Anime Error:", error.message);
            await sock.sendMessage(jid, { text: '❌ Failed to search anime. API might be down.' }, { quoted: msg });
        }
    }
};
