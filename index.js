const { Client } = require('discord.js-selfbot-v13');
const express = require('express');
const fs = require('fs');
const app = express();

// Render'ın kapanmasını önleyen sunucu
app.get("/", (req, res) => res.send("Bot Durumu: Aktif ve Giriş Deniyor..."));
app.listen(process.env.PORT || 10000, () => {
    console.log("🌐 Web sunucusu hazır.");
});

const token = process.env.TOKEN;
const channelId = process.env.CHANNEL_ID;

if (token && channelId) {
    const client = new Client({ 
        checkUpdate: false,
        readyStatus: false // Bazı güncellemeleri atlamak için
    });

    console.log("🚀 Bot başlatılıyor...");

    client.on('ready', async () => {
        console.log(`✅ BAŞARILI: ${client.user.tag} giriş yaptı!`);
        
        try {
            const data = fs.readFileSync('mesajlar.txt', 'utf8');
            const messages = data.split('\n').filter(line => line.trim() !== '');
            
            if (messages.length === 0) return console.error("❌ mesajlar.txt boş!");

            console.log(`📂 ${messages.length} mesaj yüklendi. Döngü başlıyor...`);
            
            let i = 0;
            while (true) {
                const currentMsg = messages[i];
                const channel = await client.channels.fetch(channelId);
                
                if (channel) {
                    await channel.sendTyping();
                    // Yazma hızı: Harf başı 150ms + 1sn
                    const waitTime = (currentMsg.length * 150) + 1000;
                    console.log(`✍️ Yazılıyor: ${i+1}. satır...`);
                    
                    await new Promise(r => setTimeout(r, waitTime));
                    
                    await channel.send(currentMsg);
                    console.log(`✅ Gönderildi: ${currentMsg.substring(0, 15)}...`);
                }

                i = (i + 1) % messages.length;
                await new Promise(r => setTimeout(r, 2500)); // Mesaj arası 2.5sn bekleme
            }
        } catch (err) {
            console.error("❌ HATA:", err.message);
        }
    });

    console.log("🔑 Discord'a bağlanılıyor...");
    client.login(token).catch((err) => {
        console.error("❌ KRİTİK GİRİŞ HATASI!");
        console.error("Hata Mesajı:", err.message);
        if(err.message.includes("401")) console.log("👉 İPUCU: Token hatalı görünüyor.");
        if(err.message.includes("Used Cloudflare")) console.log("👉 İPUCU: Render IP'si Discord tarafından engellenmiş.");
    });

} else {
    console.error("❌ TOKEN veya CHANNEL_ID bulunamadı!");
}
