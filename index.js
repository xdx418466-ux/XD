const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const http = require('http');

const tokens = [process.env.TOKEN1, process.env.TOKEN2, process.env.TOKEN3];
const targetChannelName = (process.env.CHANNEL_NAME || "").trim().toLowerCase();
const messageFiles = ['mesaj1.txt', 'mesaj2.txt', 'mesaj3.txt'];
const clients = [];

// --- RENDER WEB SERVER ---
const server = http.createServer((req, res) => {
    res.write("Botlar Direkt Modda Calisiyor");
    res.end();
});
server.listen(process.env.PORT || 10000);

tokens.forEach((token, index) => {
    if (!token) return;
    const client = new Client({ checkUpdate: false });
    clients.push(client);

    client.on('ready', async () => {
        console.log(`✅ Bot ${index + 1} Giriş Yaptı: ${client.user.tag}`);
        
        // Durum Çubuğu Döngüsü (%1...%100)
        let yuzde = 1;
        setInterval(() => {
            client.user.setPresence({
                activities: [{ name: `Yükleniyor... %${yuzde}`, type: 'PLAYING' }]
            });
            yuzde = (yuzde % 100) + 1;
        }, 1000);

        // --- KOMUT BEKLEMEDEN DİREKT BAŞLAT ---
        console.log(`🚀 ${client.user.username} için saldırı otomatik başlatılıyor...`);
        runAutoSpammer(client, messageFiles[index]);
    });

    client.login(token).catch(err => console.error(`❌ Giriş Hatası: ${err.message}`));
});

async function runAutoSpammer(client, fileName) {
    if (!fs.existsSync(fileName)) return;
    const messages = fs.readFileSync(fileName, 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    // Bot kanalı bulana kadar döngüde kalır
    while (true) {
        try {
            // Kanalları cache'den veya fetch ile bul
            const channel = client.channels.cache.find(c => 
                c.name && c.name.toLowerCase() === targetChannelName
            );

            if (!channel) {
                console.log(`[${client.user.username}] #${targetChannelName} kanalı aranıyor...`);
                await new Promise(r => setTimeout(r, 5000)); // 5 saniye bekle tekrar ara
                continue;
            }

            await channel.sendTyping();
            await channel.send(messages[i]);
            console.log(`🚀 [${client.user.username}] Mesaj gönderildi: ${messages[i].substring(0,15)}...`);

            i = (i + 1) % messages.length;
            const delay = 2500 + (clients.indexOf(client) * 400); 
            await new Promise(r => setTimeout(r, delay));

        } catch (err) {
            // Eğer loglarda "Hata Yakalandı" görüyorsan Discord engelliyordur
            console.log(`❌ HATA [${client.user.username}]: ${err.message}`);
            if (err.status === 429) await new Promise(r => setTimeout(r, 15000));
            await new Promise(r => setTimeout(r, 4000));
        }
    }
}
