const { Client } = require('discord.js-selfbot-v13');
const express = require('express');
const fs = require('fs');
const app = express();

// Render'ın uyku moduna geçmesini önlemek için basit sunucu
app.get("/", (req, res) => res.send("Sonsuz Döngü Botu Aktif!"));
app.listen(process.env.PORT || 10000);

const token = process.env.TOKEN;
const channelId = process.env.CHANNEL_ID;

if (token && channelId) {
    const client = new Client({ checkUpdate: false });

    client.on('ready', async () => {
        console.log(`✅ Giriş Yapıldı: ${client.user.tag}`);
        
        try {
            const data = fs.readFileSync('mesajlar.txt', 'utf8');
            const messages = data.split('\n').filter(line => line.trim() !== '');
            console.log(`📂 ${messages.length} satır yüklendi. Döngü başlıyor...`);
            
            // Ana döngüyü başlat
            startLoop(client, messages);
        } catch (err) {
            console.error("❌ Dosya okuma hatası:", err.message);
        }
    });

    client.login(token).catch(() => console.error("⚠️ Token geçersiz!"));
}

async function startLoop(client, messages) {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return;

    let i = 0;
    while (true) { // Sonsuz döngü
        const currentMsg = messages[i];

        // 1. "Yazıyor..." simgesini göster
        await channel.sendTyping();
        
        // 2. İnsan yazma hızı simülasyonu (Harf başı 150ms + 1sn sabit)
        const waitTime = (currentMsg.length * 150) + 1000;
        console.log(`✍️ Sıra: ${i + 1} | Bekleme: ${waitTime}ms`);
        
        await new Promise(r => setTimeout(r, waitTime));

        // 3. Mesajı Gönder
        try {
            await channel.send(currentMsg);
            console.log(`✅ Gönderildi: ${i + 1}/${messages.length}`);
        } catch (e) {
            console.error("❌ Mesaj gönderilemedi:", e.message);
        }

        // 4. İndeksi güncelle (Liste biterse başa dön)
        i = (i + 1) % messages.length;

        // 5. Bir sonraki mesaj için 2 saniye nefes payı
        await new Promise(r => setTimeout(r, 2000));
    }
}
