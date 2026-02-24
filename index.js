const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const http = require('http');

const tokens = [process.env.TOKEN1, process.env.TOKEN2, process.env.TOKEN3];
const targetChannelName = (process.env.CHANNEL_NAME || "").trim().toLowerCase();
// GitHub'daki dosya isimlerinle birebir eşitledim:
const messageFiles = ['mesajlar.txt1', 'mesajlar.txt2', 'mesajlar.txt3']; 
const clients = [];

const server = http.createServer((req, res) => {
    res.write("Sistem Aktif");
    res.end();
});
server.listen(process.env.PORT || 10000);

tokens.forEach((token, index) => {
    if (!token) return;
    const client = new Client({ checkUpdate: false });
    clients.push(client);

    client.on('ready', async () => {
        console.log(`✅ Bot ${index + 1} Aktif: ${client.user.tag}`);
        
        // %1 - %100 Sayaç
        let yuzde = 1;
        setInterval(() => {
            client.user.setPresence({
                activities: [{ name: `Yükleniyor... %${yuzde}`, type: 'PLAYING' }]
            });
            yuzde = (yuzde % 100) + 1;
        }, 1000);

        // HİÇBİR KOMUT BEKLEMEDEN DİREKT BAŞLAT
        runAutoSpammer(client, messageFiles[index]);
    });

    client.login(token).catch(err => console.error(`❌ Giriş Hatası: ${err.message}`));
});

async function runAutoSpammer(client, fileName) {
    // Dosya kontrolü
    if (!fs.existsSync(fileName)) {
        console.log(`❌ HATA: ${fileName} dosyası bulunamadı!`);
        return;
    }

    const messages = fs.readFileSync(fileName, 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    while (true) {
        try {
            // Kanalı isme göre bul
            const channel = client.channels.cache.find(c => 
                c.name && c.name.toLowerCase() === targetChannelName
            );

            if (!channel) {
                console.log(`[${client.user.username}] #${targetChannelName} aranıyor...`);
                await new Promise(r => setTimeout(r, 5000));
                continue;
            }

            await channel.sendTyping();
            
            // Direkt mesajı gönder (Eğer mesajlar.txt içine etiketleri eklediysen direkt atar)
            await channel.send(messages[i]);
            console.log(`🚀 [${client.user.username}] Mesaj atıldı.`);

            i = (i + 1) % messages.length;
            const delay = 2500 + (clients.indexOf(client) * 500); 
            await new Promise(r => setTimeout(r, delay));

        } catch (err) {
            console.log(`❌ [${client.user.username}] HATA: ${err.message}`);
            if (err.status === 429) await new Promise(r => setTimeout(r, 15000));
            await new Promise(r => setTimeout(r, 4000));
        }
    }
}
