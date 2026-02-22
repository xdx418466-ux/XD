const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const client = new Client({ checkUpdate: false });

const token = process.env.TOKEN;
const targetName = (process.env.CHANNEL_NAME || "x").toLowerCase(); 
let currentChannelId = null; // Bot yeni ID'yi buraya kaydedecek

client.on('ready', async () => {
    console.log(`✅ Sistem Aktif: ${client.user.tag}`);
    const messages = fs.readFileSync('mesajlar.txt', 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    while (true) {
        try {
            // 1. ADIM: EĞER ID YOKSA VEYA KANAL SİLİNDİYSE YENİ ID'Yİ BUL
            let channel = client.channels.cache.get(currentChannelId);

            if (!channel || channel.name.toLowerCase() !== targetName) {
                // İsmi "x" olan kanalı ara
                const targetChannel = client.channels.cache.find(c => 
                    c.name && c.name.toLowerCase() === targetName && 
                    (c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS')
                );

                if (targetChannel) {
                    currentChannelId = targetChannel.id; // YENİ ID'Yİ HAFIZAYA ALDI
                    channel = targetChannel;
                    console.log(`🎯 Yeni Kanal ID Tespit Edildi: ${currentChannelId}`);
                } else {
                    // Kanal henüz açılmamışsa pusuya devam
                    await new Promise(r => setTimeout(r, 200));
                    continue;
                }
            }

            // 2. ADIM: MESAJI GÖNDER
            const msg = messages[i];
            await channel.sendTyping(); 

            let yazmaSuresi = 0;
            for (let char of msg) {
                yazmaSuresi += Math.floor(Math.random() * (90 - 60 + 1)) + 60;
            }
            await new Promise(r => setTimeout(r, yazmaSuresi));

            await channel.send(msg);
            console.log(`🚀 [#${channel.name}] Mesaj Gönderildi. (ID: ${channel.id})`);

            i = (i + 1) % messages.length;
            await new Promise(r => setTimeout(r, 200));

        } catch (err) {
            if (err.status === 429 || err.message.includes('rate limit')) {
                console.log(`⏳ Rate Limit! 2 saniye bekleniyor...`);
                await new Promise(r => setTimeout(r, 2000));
            } else {
                // Kanal silindiğinde hata verirse ID'yi sıfırla ki bot yeni ID'yi arasın
                currentChannelId = null;
                await new Promise(r => setTimeout(r, 200));
            }
        }
    }
});

require('http').createServer((req, res) => res.end("Aktif")).listen(process.env.PORT || 10000);
client.login(token);
