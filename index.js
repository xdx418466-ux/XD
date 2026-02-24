const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const http = require('http');

// Render Environment Variables kısmından TOKEN1, TOKEN2, TOKEN3 eklemeyi unutma
const tokens = [process.env.TOKEN1, process.env.TOKEN2, process.env.TOKEN3];
const messageFiles = ['mesaj1.txt', 'mesaj2.txt', 'mesaj3.txt'];
const clients = [];

let saldiriDurumu = false;
let globalTargetId = "";

// --- RENDER WEB SERVER ---
const server = http.createServer((req, res) => {
    res.write("Botlar Aktif");
    res.end();
});
server.listen(process.env.PORT || 10000);

// --- BOTLARI OLUŞTUR VE BAŞLAT ---
tokens.forEach((token, index) => {
    if (!token) return;

    const client = new Client({ checkUpdate: false });
    clients.push(client);

    client.on('ready', () => {
        console.log(`✅ Bot ${index + 1} Hazır: ${client.user.tag}`);
        
        // Durum Çubuğu Döngüsü (%1...%100)
        let yuzde = 1;
        setInterval(() => {
            client.user.setPresence({
                activities: [{ name: `Yükleniyor... %${yuzde}`, type: 'PLAYING' }]
            });
            yuzde = (yuzde % 100) + 1;
        }, 1000);
    });

    client.on('messageCreate', async (msg) => {
        // Komutu sadece sen (tokenlardan biri) yazarsan çalışır
        if (msg.author.id !== client.user.id) return;

        // BAŞLATMA: -launch an attack [ID]
        if (msg.content.startsWith('-launch an attack')) {
            const args = msg.content.split(' ');
            globalTargetId = args[3] ? args[3].replace(/\D/g, "") : "";
            
            if (!saldiriDurumu) {
                saldiriDurumu = true;
                console.log(`🚀 Saldırı Başlatıldı! Hedef: ${globalTargetId}`);
                
                // Tüm botları aynı anda döngüye sok
                clients.forEach((c, i) => {
                    runSpammer(c, messageFiles[i], msg.channel.id);
                });
            }
        }

        // DURDURMA: -end the attack
        if (msg.content === '-end the attack') {
            saldiriDurumu = false;
            console.log("🛑 Saldırı Durduruldu.");
        }
    });

    client.login(token).catch(err => console.error(`❌ Token ${index + 1} Hatası:`, err.message));
});

// --- ANA SPAMMER DÖNGÜSÜ ---
async function runSpammer(client, fileName, channelId) {
    if (!fs.existsSync(fileName)) return console.error(`${fileName} bulunamadı!`);
    
    const messages = fs.readFileSync(fileName, 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    while (saldiriDurumu) {
        try {
            const channel = client.channels.cache.get(channelId);
            if (!channel) break;

            // "Yazıyor..." bilgisini gönder
            await channel.sendTyping();

            let anaMesaj = messages[i];
            let finalMsg = globalTargetId ? `${anaMesaj} <@${globalTargetId}>` : anaMesaj;

            await channel.send(finalMsg);
            
            i = (i + 1) % messages.length;

            // Her botun hızı (IP ban riskini azaltmak için botlar arası hafif fark)
            const delay = 2200 + (clients.indexOf(client) * 200); 
            await new Promise(r => setTimeout(r, delay));

        } catch (err) {
            console.log(`⚠️ ${client.user.tag} Hatası:`, err.message);
            if (err.status === 429) {
                await new Promise(r => setTimeout(r, 15000)); // Rate limit varsa 15sn dur
            }
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}
