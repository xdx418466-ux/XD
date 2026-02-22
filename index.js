const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot aktif ve Render üzerinde çalışıyor!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda dinleniyor.`);
});

const token = process.env.TOKEN;
const channelId = process.env.CHANNEL_ID;
const message = process.env.MESSAGE;

if (!token || !channelId || !message) {
    console.error("HATA: TOKEN, CHANNEL_ID veya MESSAGE eksik!");
} else {
    // Mesaj döngüsünü başlat
    setInterval(sendMessage, 5000);
}

// "Yazıyor..." efektini gönderen fonksiyon
async function sendTyping() {
  try {
    await axios.post(`https://discord.com/api/v9/channels/${channelId}/typing`, {}, {
      headers: { "Authorization": token }
    });
  } catch (err) {
    console.error("Yazıyor bilgisi gönderilemedi.");
  }
}

async function sendMessage() {
  // Mesajdan hemen önce "yazıyor..." göster
  await sendTyping();

  // Kısa bir gecikme ekleyerek daha gerçekçi görünmesini sağlayabilirsin (isteğe bağlı)
  setTimeout(() => {
    axios.post(`https://discord.com/api/v9/channels/${channelId}/messages`, {
      content: message
    }, {
      headers: {
        "Authorization": token,
        "Content-Type": "application/json"
      }
    }).then(() => {
      console.log(`✅ Mesaj başarıyla gönderildi: "${message}"`);
    }).catch((err) => {
      console.error("❌ Mesaj gönderilemedi. Hata:", err.response?.status, err.response?.data);
    });
  }, 1000); // 1 saniye "yazıyor" göründükten sonra mesajı atar
}
