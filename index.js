const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const client = new Client({ checkUpdate: false });

// --- AYARLAR ---
const TARGET_CHANNEL_NAME = "X"; // Kanal silinirse aranacak KANAL ADI (Burayı değiştirme veya X yap)
let currentChannelId = process.env.CHANNEL_ID; 

client.on('ready', async () => {
    console.log(`✅ Giriş Başarılı: ${client.user.tag}`);
    
    const messages = fs.readFileSync('mesajlar.txt', 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    while (true) {
        try {
            // 1. Önce eldeki mevcut ID ile kanalı kontrol et
            let channel = await client.channels.fetch(currentChannelId).catch(() => null);

            // 2. KANAL BULUNAMAZSA (SİLİNMİŞSE) İSİM İLE ARA
            if (!channel || channel.type !== 'GUILD_TEXT') {
                console.log(`⚠️ Kanal kayboldu! "${TARGET_CHANNEL_NAME}" isimli yeni kanal aranıyor...`);
                
                // Botun olduğu sunuculardaki tüm kanalları tara
                const newChannel = client.channels.cache.find(c => 
                    c.name.toLowerCase() === TARGET_CHANNEL_NAME.toLowerCase() && 
                    c.type === 'GUILD_TEXT'
                );

                if (newChannel) {
                    currentChannelId = newChannel.id; // Yeni ID'yi hafızaya al
                    channel = newChannel;
                    console.log(`🎯 Hedef kanal yeniden bulundu! Yeni ID: ${currentChannelId}`);
                } else {
                    console.log(`❌ "${TARGET_CHANNEL_NAME}" isimli kanal hala yok. 5 saniye sonra tekrar aranacak...`);
                    await new Promise(r => setTimeout(r, 5000));
                    continue;
                }
            }

            // 3. MESAJ GÖNDERME (HIZLI MOD)
            const msg = messages[i];
            
            await channel.sendTyping(); // "Yazıyor..." simgesi
            
            // Hız: Harf başı 50ms (Hızlı ama insansı)
            const yazmaSuresi = (msg.length * 50) + 400; 
            await new Promise(r => setTimeout(r, yazmaSuresi));

            await channel.send(msg);
            console.log(`✅ [${channel.name}] kanalına gönderildi: ${msg}`);

            i = (i + 1) % messages.length;
            
            // Mesajlar arası bekleme: 1.2 saniye (Oldukça seri)
            await new Promise(r => setTimeout(r, 1200)); 

        } catch (e) {
            console.error("⚠️ Hata oluştu (Muhtemelen yetki yok):", e.message);
            await new Promise(r => setTimeout(r, 5000)); // Hata durumunda 5 sn bekle
        }
    }
});

// Render'ın kapanmaması için gerekli web server
require('http').createServer((req, res) => res.end("Bot Aktif")).listen(process.env.PORT || 10000);

client.login(process.env.TOKEN).catch(err => {
    console.error("❌ LOGIN HATASI: Token'ı kontrol et!");
});
