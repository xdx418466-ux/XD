const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const client = new Client({ checkUpdate: false });

client.on('ready', async () => {
    console.log(`✅ Giriş Başarılı: ${client.user.tag}`);
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    
    // mesajlar.txt dosyasını oku
    const messages = fs.readFileSync('mesajlar.txt', 'utf8').split('\n').filter(l => l.trim());

    let i = 0;
    while (true) {
        const msg = messages[i];
        
        // 1. Yazıyor simgesini başlat
        await channel.sendTyping(); 
        
        // 2. YENİ HIZ AYARI (Yaklaşık 80-100 WPM)
        // Harf başına 50ms bekleme + 500ms sabit pay
        const yazmaSuresi = (msg.length * 50) + 500; 
        console.log(`⚡ Hızlı Yazılıyor: "${msg}" (${yazmaSuresi}ms)`);
        
        await new Promise(r => setTimeout(r, yazmaSuresi));

        // 3. Mesajı gönder
        try {
            await channel.send(msg);
            console.log(`✅ Gönderildi.`);
        } catch (e) {
            console.error("❌ Mesaj hatası:", e.message);
        }

        i = (i + 1) % messages.length;
        
        // 4. Mesajlar arası bekleme (Bunu da 1.5 saniyeye düşürdüm)
        await new Promise(r => setTimeout(r, 1500)); 
    }
});

client.login(process.env.TOKEN);

// Render için hayatta kalma sunucusu
require('http').createServer((req, res) => res.end("Bot Aktif")).listen(process.env.PORT || 10000);
