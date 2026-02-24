const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const http = require('http');

const tokens = [process.env.TOKEN1, process.env.TOKEN2, process.env.TOKEN3];
const targetChannelName = (process.env.CHANNEL_NAME || "").trim().toLowerCase();
const messageFiles = ['mesajlar.txt1', 'mesajlar.txt2', 'mesajlar.txt3']; 
const clients = [];

let saldiriDurumu = false;
let globalTargetId = "";

const server = http.createServer((req, res) => {
    res.write("Sistem Aktif - Durum Yazisi Kaldirildi");
    res.end();
});
server.listen(process.env.PORT || 10000);

tokens.forEach((token, index) => {
    if (!token) return;
    const client = new Client({ checkUpdate: false });
    clients.push(client);

    client.on('ready', () => {
        console.log(`✅ Bot ${index + 1} Aktif: ${client.user.tag}`);
        
        // DURUM YAZISI (setPresence) BURADAN KALDIRILDI
    });

    client.on('messageCreate', async (msg) => {
        if (msg.author.id !== client.user.id) return;
        if (!msg.channel.name || msg.channel.name.toLowerCase() !== targetChannelName) return;

        if (msg.content.includes('-launch an attack')) {
            const match = msg.content.match(/\d{17,20}/);
            globalTargetId = match ? match[0] : "";
            
            if (!saldiriDurumu) {
                saldiriDurumu = true;
                console.log(`🚀 Hizli Sirali Saldiri Basladi! Kanal: ${targetChannelName}`);
                
                // 0.2s aralıklarla botları sıraya koyar
                clients.forEach((c, i) => {
                    setTimeout(() => {
                        if (saldiriDurumu) runSpammer(c, messageFiles[i], msg.channel.id);
                    }, i * 200); 
                });
            }
        }

        if (msg.content.includes('-end the attack')) {
            saldiriDurumu = false;
            console.log("🛑 Saldiri Durduruldu.");
        }
    });

    client.login(token).catch(err => console.error(`❌ Giris Hatasi: ${err.message}`));
});

async function runSpammer(client, fileName, channelId) {
    if (!fs.existsSync(fileName)) return;
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
            console.log(`🚀 [${client.user.username}] Mesaj Atildi.`);

            i = (i + 1) % messages.length;

            await new Promise(r => setTimeout(r, 2200)); 

        } catch (err) {
            console.log(`❌ HATA: ${err
