const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const client = new Client({ checkUpdate: false });

// Değişkenleri Render Environment'tan alıyoruz
const token = process.env.TOKEN;
const targetNameFromEnv = process.env.CHANNEL_NAME || "x"; // Render'da yoksa varsayılan 'x'
let currentChannelId = process.env.CHANNEL_ID;

client.on('ready', async () => {
    console.log(`✅ Giriş Başarılı: ${client.user.tag}`);
    console.log(`🎯 Hedef Kanal İsmi: ${targetNameFromEnv}`);
    
    const messages = fs.readFileSync('mesajlar.txt', 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    while (true) {
        try {
            // 1. Kanalları her seferinde tazelemek için cache'i kontrol et
            let channel = client.channels.cache.get(currentChannelId);

            // 2. Kanal yoksa, silindiyse veya ismi değiştiyse isme göre ara
            if (!channel || channel.name.toLowerCase() !== targetNameFromEnv.toLowerCase()) {
                console.log(`🔍 "${targetNameFromEnv}" isimli kanal taranıyor...`);
                
                channel = client.channels.cache.find(c => 
                    c.name && 
                    c.name.toLowerCase() === targetNameFromEnv.toLowerCase() && 
                    (c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS')
                );

                if (channel) {
                    currentChannelId = channel.id;
                    console.log(`🎯 Kanal Bulundu ve ID Güncellendi: #${channel.name} (${channel.id})`);
                } else {
                    console.log(`⚠️ Sunucularda "${targetNameFromEnv}" isimli bir kanal hala yok.`);
                    await new Promise(r => setTimeout(r, 5000));
                    continue;
                }
            }

            // 3. Mesaj Gönderimi (Hızlı Mod)
            const msg = messages[i];
            await channel.sendTyping();
            
            const waitTime = (msg.length * 40) + 300; // Harf başı 40ms
            await new Promise(r => setTimeout(r, waitTime));

            await channel.send(msg);
            console.log(`✅ [${channel.name}] kanalına gönderildi.`);

            i = (i + 1) % messages.length;
            await new Promise(r => setTimeout(r, 1200)); // 1.2 saniye mola

        } catch (err) {
            console.log(`⚠️ Hata: ${err.message}. Yeniden deneniyor...`);
            currentChannelId = null; 
            await new Promise(r => setTimeout(r, 4000));
        }
    }
});

require('http').createServer((req, res) => res.end("Bot Aktif")).listen(process.env.PORT || 10000);
client.login(token);
