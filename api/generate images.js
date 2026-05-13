export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Gunakan method POST"
    });
  }

  // =====================================
  // AMBIL DATA DARI FRONTEND
  // =====================================

  const { expenses } = req.body;

  if (!expenses) {
    return res.status(400).json({
      error: "Data pengeluaran kosong"
    });
  }

  try {

    // =====================================
    // PROMPT IMAGE AI
    // =====================================

    const prompt = `
Berikut adalah data pengeluaran mahasiswa:

${expenses}

Bayangkan data pengeluaran tersebut direpresentasikan
sebagai satu karakter mahasiswa yang lucu.

Tentukan karakter berdasarkan pola pengeluaran:

- jika hemat:
  karakter sederhana, rapi, membawa buku atau celengan

- jika sedang:
  karakter santai dan teratur

- jika boros:
  karakter membawa banyak kantong belanja,
  uang berhamburan, atau ekspresi panik

Ketentuan gambar:

- gaya ilustrasi kartun/chibi/cute
- satu karakter utama
- warna cerah dan menarik
- desain modern dan lucu
- boleh menambahkan properti kecil
  seperti dompet, makanan, kopi, laptop,
  tas belanja, atau uang

- jangan ada teks dalam gambar

Gambar harus mencerminkan pola pengeluaran mahasiswa.
    `;

    // =====================================
    // REQUEST IMAGE AI
    // =====================================

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({

          model: "gpt-image-1",

          prompt: prompt,

          size: "1024x1024"
        })
      }
    );

    const data = await response.json();

    // =====================================
    // JIKA ERROR
    // =====================================

    if (!response.ok) {

      return res.status(response.status).json({
        error:
          data.error?.message ||
          "Gagal membuat gambar"
      });
    }

    // =====================================
    // KIRIM IMAGE KE FRONTEND
    // =====================================

    return res.status(200).json({

      image: data.data[0].b64_json
    });

  } catch (error) {

    return res.status(500).json({
      error: "Gagal menghubungi image API"
    });
  }
}
