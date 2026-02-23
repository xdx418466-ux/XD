const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const http = require('http');

let client = new Client({ checkUpdate: false });

const token = process.env.TOKEN;
const targetName = (process.env.CHANNEL_NAME || "x").toLowerCase(); 
const targetUserId = (process.env.TARGET_USER_ID || "").replace(/\D/g, "");

// --- RENDER'I UYANIK TUTAN WEB SERVER ---
const server = http.createServer((req, res) => {
    res.write("Bot Durumu: Calisiyor");
    res.end();
});

server.listen(process.env.PORT || 10000, () => {
    console.log("📡 Render Portu Dinleniyor...");
});

// Kendi kendine ping atarak uyumayı engelle
setInterval(() => {
    http.get(`http://localhost:${process.env.PORT || 10000}`);
}, 5 * 60 * 1000); // 5 dakikada bir

async function startBot() {
    try {
        await client.login(token);
    } catch (err) {
        console.error("❌ Giriş Hatası, 10sn sonra tekrar denenecek:", err.message);
        setTimeout(startBot, 10000);
    }
}

client.on('ready', async () => {
    console.log(`✅ ${client.user.tag} Aktif!`);
    runSpammer();
});

// Bağlantı koparsa otomatik tekrar bağlan
client.on('shardDisconnect', () => {
    console.log("⚠️ Bağlantı kesildi, yeniden bağlanılıyor...");
    startBot();
});

async function runSpammer() {
    const messages = fs.readFileSync('mesajlar.txt', 'utf8').split('\n').filter(l => l.trim());
    let i = 0;
    let currentChannelId = null;

    while (true) {
        try {
            let channel = client.channels.cache.get(currentChannelId);
            
            if (!channel || channel.name.toLowerCase() !== targetName) {
                const targetChannel = client.channels.cache.find(c => c.name && c.name.toLowerCase() === targetName);
                if (targetChannel) {
                    currentChannelId = targetChannel.id;
                    channel = targetChannel;
                } else {
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }
            }

            let anaMesaj = messages[i];
            let finalMsg = targetUserId ? `${anaMesaj} <@${targetUserId}>` : anaMesaj;

            await channel.send(finalMsg);
            console.log(`🚀 Gönderildi: ${anaMesaj.substring(0, 10)}...`);

            i = (i + 1) % messages.length;

            // --- BURASI KRİTİK ---
            // Durmaması için hızı 1.5 - 2 saniye civarında tutmanı öneririm.
            // Saniyede 1 mesajdan fazlası hesabı kesin kapattırır veya botu durdurur.
            await new Promise(r => setTimeout(r, 1800)); 

        } catch (err) {
            console.log("⚠️ Hata Yakalandı, devam ediliyor...");
            if (err.status === 429) {
                // Discord seni engellediyse 10 saniye tam dur
                await new Promise(r => setTimeout(r, 10000));
            }
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

startBot();
