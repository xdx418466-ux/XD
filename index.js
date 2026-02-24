const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const http = require('http');

const tokens = [process.env.TOKEN1, process.env.TOKEN2, process.env.TOKEN3];
const messageFiles = ['mesajlar.txt1', 'mesajlar.txt2', 'mesajlar.txt3']; 
const clients = [];

// SENİN DISCORD ID'N - SADECE SEN KOMUT VEREBİLİRSİN
const adminId = "1411681601846378599";

let saldiriDurumu = false;
let globalTargetId = "";

const server = http.createServer((req, res) => {
    res.write("Sistem Aktif - Durum Yazisi Temizlendi");
    res.end();
});
server.listen(process.env.PORT || 10000);

tokens.forEach((token, index) => {
    if (!token) return;
    const client = new Client({ checkUpdate: false });
    clients.push(client);

    client.on('ready', () => {
        console.log(`✅ Bot ${index + 1} Hazır: ${client.user.tag}`);
        
        // DURUMU TAMAMEN SIFIRLA VE TEMİZLE
        client.user.setPresence({ activities: [], status: 'dnd' });
    });

    client.on('messageCreate', async (msg) => {
        // Güvenlik: Sadece senin ID'n komut verebilir
        if (msg.author.id !== adminId) return;

        // BAŞLATMA: -launch an attack [ID]
        if (msg.content.includes('-launch an attack')) {
            const match = msg.content.match(/\d{17,20}/);
            globalTargetId = match ? match[0] : "";
            
            if (!saldiriDurumu) {
                saldiriDurumu = true;
                console.log(`🚀 Sıralı saldırı senin emrinle başlatıldı.`);
                
                clients.forEach((c, i) => {
                    setTimeout(() => {
                        if (saldiriDurumu) runSpammer(c, messageFiles[i], msg.channel.id);
                    }, i * 200); // İstediğin 0.2s - 0.4s sıralaması
                });
            }
        }

        // DURDURMA: -end the attack
        if (msg.content.includes('-end the attack')) {
            saldiriDurumu = false;
            console.log("🛑 Saldırı durduruldu.");
        }
    });

    client.login(token).catch(err => console.error(`❌ Giriş Hatası: ${err.message}`));
});

async function runSpammer(client, fileName, channelId) {
    if (!fs.existsSync(fileName)) {
        console.log(`❌ Dosya eksik: ${fileName}`);
        return;
    }
    const messages = fs.readFileSync(fileName, 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    while (saldiriDurumu) {
        try {
            const channel = await client.channels.fetch(channelId).catch(() => null);
            if (!channel) break;

            await channel.sendTyping();

            let anaMesaj = messages[i];
            let finalMsg = globalTargetId ? `${anaMesaj} <@${globalTargetId}>` : anaMesaj;

            await channel.send(finalMsg);
            console.log(`🚀 [${client.user.username}] Mesaj gönderdi.`);

            i = (i + 1) % messages.length;
            await new Promise(r => setTimeout(r, 2200)); 

        } catch (err) {
            console.log(`❌ HATA: ${err.message}`);
            if (err.status === 429) await new Promise(r => setTimeout(r, 15000));
            await new Promise(r => setTimeout(r, 3000));
        }
    }
}
