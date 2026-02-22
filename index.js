const { Client } = require('discord.js-selfbot-v13');
const express = require('express');
const fs = require('fs');
const app = express();

// Render'ın uyku moduna geçmesini önlemek için web sunucusu
app.get("/", (req, res) => res.send("Sistem Aktif: Mesaj Döngüsü ve Yazıyor Efekti Çalışıyor..."));
app.listen(process.env.PORT || 10000, () => {
    console.log("🌐 Web sunucusu 10000 portunda başlatıldı.");
});

// Environment Variables (Ortam Değişkenleri)
const token = process.env.TOKEN;
const channelId = process.env.CHANNEL_ID;

if (token && channelId) {
    console.log("🚀 Bot başlatılıyor...");
    const client = new Client({ checkUpdate: false });

    client.on('ready', async () => {
        console.log(`✅ BAŞARILI: ${client.user.tag} olarak giriş yapıldı!`);
        
        try {
            // mesajlar.txt dosyasını oku
            const data = fs.readFileSync('mesajlar.txt', 'utf8');
            const messages = data.split('\n').filter(line => line.trim() !== '');
            
            if (messages.length === 0) {
                console.error("❌ HATA: mesajlar.txt dosyası boş!");
                return;
            }

            console.log(`📂 ${messages.length} satır mesaj yüklendi. Döngü başlıyor...`);
            startInfiniteLoop(client, messages);

        } catch (err) {
            console.error("❌ HATA: mesajlar.txt dosyası okunamadı:", err.message);
        }
    });

    // Giriş denemesi
    console.log("🔑 Discord'a bağlanılıyor... (Token kontrol ediliyor)");
    client.login(token).catch((err) => {
        console.error("❌ GİRİŞ HATASI: Token geçersiz olabilir veya IP engellenmiş olabilir.");
        console.error("Detay:", err.message);
    });

} else {
    console.error("❌ KRİTİK HATA: Render panelinde TOKEN veya CHANNEL_ID eksik!");
}

// Ana Döngü Fonksiyonu
async function startInfiniteLoop(client, messages) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            console.error("❌ HATA: Kanal bulunamadı! ID doğru mu?");
            return;
        }

        let i = 0;
        while (true) { // Sonsuz döngü
            const currentMsg = messages[i];

            // 1. "Yazıyor..." simgesini göster
            await channel.sendTyping();
            
            // 2. İnsan yazma hızı (Harf başı 150ms + 1sn sabit)
            const waitTime = (currentMsg.length * 150) + 1000;
            console.log(`✍️ Yazılıyor... Sıra: ${i + 1}/${messages.length} | Bekleme: ${waitTime}ms`);
            
            await new Promise(r => setTimeout(r, waitTime));

            // 3. Mesajı Gönder
            try {
                await channel.send(currentMsg);
                console.log(`✅ Gönderildi: "${currentMsg.substring(0, 20)}..."`);
            } catch (e) {
                console.error(`❌ Mesaj gönderilemedi (Sıra ${i+1}):`, e.message);
            }

            // 4. İndeksi güncelle (Liste biterse başa dön)
            i = (i + 1) % messages.length;

            // 5. İki mesaj arası 2 saniye dinlenme payı
            await new Promise(r => setTimeout(r, 2000));
        }
    } catch (err) {
        console.error("❌ Döngü sırasında bir hata oluştu:", err.message);
    }
}
