const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const client = new Client({ checkUpdate: false });

// --- AYARLAR ---
const TARGET_CHANNEL_NAME = "x"; // Aramak istediğin kanal adı (Küçük harfle yaz)
let currentChannelId = process.env.CHANNEL_ID;

client.on('ready', async () => {
    console.log(`✅ Giriş Başarılı: ${client.user.tag}`);
    
    const messages = fs.readFileSync('mesajlar.txt', 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    while (true) {
        try {
            // 1. Mevcut kanalı kontrol et
            let channel = client.channels.cache.get(currentChannelId);

            // 2. Kanal yoksa veya silindiyse tüm sunucularda ara
            if (!channel) {
                console.log(`🔍 Kanal kayıp, "${TARGET_CHANNEL_NAME}" aranıyor...`);
                
                // Cache'i zorla kontrol et ve ismi eşleşen ilk metin kanalını al
                channel = client.channels.cache.find(c => 
                    c.name && 
                    c.name.toLowerCase() === TARGET_CHANNEL_NAME.toLowerCase() && 
                    (c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS')
                );

                if (channel) {
                    currentChannelId = channel.id;
                    console.log(`🎯 Kanal Bulundu: #${channel.name} (${channel.id})`);
                } else {
                    console.log(`⚠️ Sunucularda "${TARGET_CHANNEL_NAME}" isimli kanal bulunamadı. Bekleniyor...`);
                    await new Promise(r => setTimeout(r, 5000));
                    continue;
                }
            }

            // 3. Mesaj Gönderme
            const msg = messages[i];
            await channel.sendTyping();
            
            // Hızlı yazma (Harf başı 40ms)
            const waitTime = (msg.length * 40) + 300;
            await new Promise(r => setTimeout(r, waitTime));

            await channel.send(msg);
            console.log(`✅ Mesaj Gitti: ${msg.substring(0, 15)}...`);

            i = (i + 1) % messages.length;
            await new Promise(r => setTimeout(r, 1000)); // 1 saniye mola

        } catch (err) {
            console.log(`⚠️ Hata: ${err.message}. Kanal aranıyor...`);
            currentChannelId = null; // Hata varsa kanal bilgisini sıfırla ki tekrar arasın
            await new Promise(r => setTimeout(r, 3000));
        }
    }
});

require('http').createServer((req, res) => res.end("Aktif")).listen(process.env.PORT || 10000);
client.login(process.env.TOKEN);
