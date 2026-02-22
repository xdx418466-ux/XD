const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const client = new Client({ checkUpdate: false });

// --- AYARLAR ---
const TARGET_CHANNEL_NAME = "X"; // Kanal silinirse aranacak isim (BÜYÜK/küçük harf duyarsız)
let currentChannelId = process.env.CHANNEL_ID;

client.on('ready', async () => {
    console.log(`✅ Giriş Başarılı: ${client.user.tag}`);
    
    // mesajlar.txt kontrolü
    if (!fs.existsSync('mesajlar.txt')) {
        console.error("❌ mesajlar.txt dosyası bulunamadı!");
        return;
    }
    const messages = fs.readFileSync('mesajlar.txt', 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    while (true) {
        try {
            // 1. Kanalı ID ile bulmaya çalış
            let channel = await client.channels.fetch(currentChannelId).catch(() => null);

            // 2. Kanal bulunamazsa İSİM ile ara
            if (!channel) {
                console.log(`⚠️ Kanal bulunamadı veya silindi. "${TARGET_CHANNEL_NAME}" isimli kanal aranıyor...`);
                
                // Cache'deki kanallar arasında isme göre ara
                const foundChannel = client.channels.cache.find(c => 
                    c.name.toLowerCase() === TARGET_CHANNEL_NAME.toLowerCase() && 
                    (c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS')
                );

                if (foundChannel) {
                    currentChannelId = foundChannel.id;
                    channel = foundChannel;
                    console.log(`🎯 Hedef kanal yeniden bulundu: #${channel.name} (${channel.id})`);
                } else {
                    console.log(`❌ "${TARGET_CHANNEL_NAME}" isimli kanal hiçbir sunucuda bulunamadı. 5 saniye sonra tekrar denenecek...`);
                    await new Promise(r => setTimeout(r, 5000));
                    continue; // Döngü başına dön, tekrar ara
                }
            }

            // 3. Mesaj Gönderimi (Hızlı ve "Yazıyor" efektli)
            const msg = messages[i];
            
            await channel.sendTyping(); // Yazıyor... simgesi
            
            // Hız: Harf başı 50ms + 400ms sabit (Seri ama güvenli)
            const waitTime = (msg.length * 50) + 400; 
            await new Promise(r => setTimeout(r, waitTime));

            await channel.send(msg);
            console.log(`✅ [${channel.name}] kanalına gönderildi: ${msg.substring(0, 20)}...`);

            i = (i + 1) % messages.length;
            await new Promise(r => setTimeout(r, 1200)); // Mesajlar arası 1.2 saniye mola

        } catch (err) {
            console.error("⚠️ Döngüde hata (Erişim engeli olabilir):", err.message);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
});

// Render'ın uyumasını engelleyen basit server
require('http').createServer((req, res) => res.end("Bot Aktif")).listen(process.env.PORT || 10000);

// Giriş işlemi
client.login(process.env.TOKEN).catch(err => console.error("❌ Token Hatası:", err.message));
