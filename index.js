const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const client = new Client({ checkUpdate: false });

// AYARLAR - Render Environment Variables'dan çekilir
const token = process.env.TOKEN;
const targetName = process.env.CHANNEL_NAME || "x"; // ID yerine sadece isim kullanıyoruz
let currentChannelId = null; // Başlangıçta ID boş, bot arayarak bulacak

client.on('ready', async () => {
    console.log(`✅ Giriş Yapıldı: ${client.user.tag}`);
    console.log(`🔍 Hedef: #${targetName} kanalı aranıyor...`);
    
    const messages = fs.readFileSync('mesajlar.txt', 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    while (true) {
        try {
            // 1. Kanalı isme göre bul (Her döngüde kontrol eder, silinirse anında yenisini yakalar)
            let channel = client.channels.cache.find(c => 
                c.name && c.name.toLowerCase() === targetName.toLowerCase() && 
                (c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS')
            );

            if (!channel) {
                console.log(`⚠️ "${targetName}" isimli kanal şu an yok, aranıyor...`);
                await new Promise(r => setTimeout(r, 1000)); // 1 saniye sonra tekrar tara
                continue;
            }

            // 2. Mesaj Gönderimi (Hızlı Mod)
            const msg = messages[i];
            await channel.sendTyping(); // Yazıyor... simgesi
            
            // Hız: Mesaj uzunluğuna göre çok kısa bekleme
            await new Promise(r => setTimeout(r, (msg.length * 30) + 100));

            await channel.send(msg);
            console.log(`🚀 [#${channel.name}] kanalına gönderildi.`);

            i = (i + 1) % messages.length;
            await new Promise(r => setTimeout(r, 800)); // Mesajlar arası sadece 0.8 saniye

        } catch (err) {
            console.error("⚠️ Bir hata oluştu, aranıyor...");
            await new Promise(r => setTimeout(r, 1000));
        }
    }
});

require('http').createServer((req, res) => res.end("Bot Aktif")).listen(process.env.PORT || 10000);
client.login(token);
