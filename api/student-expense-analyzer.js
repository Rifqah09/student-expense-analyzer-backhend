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
    // REQUEST KE OPENAI
    // =====================================

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({

          model: "gpt-4.1-mini",

          input: `
Berikut adalah data pengeluaran harian mahasiswa:

${expenses}

Tolong analisis data tersebut.

Berikan:
1. Total pengeluaran secara umum
2. Pengeluaran terbesar
3. Status pengeluaran:
   - Hemat
   - Sedang
   - Boros
4. Alasan singkat
5. 2 saran pengelolaan keuangan

Gunakan bahasa Indonesia yang sederhana dan rapi.
          `
        })
      }
    );

    const data = await response.json();

    // =====================================
    // JIKA ERROR DARI OPENAI
    // =====================================

    if (!response.ok) {

      return res.status(response.status).json({
        error:
          data.error?.message ||
          "Gagal mendapatkan respons dari OpenAI"
      });
    }

    // =====================================
    // AMBIL HASIL AI
    // =====================================

    let text = "";

    try {

      text =
        data.output[0].content[0].text;

    } catch (e) {

      text = JSON.stringify(data);
    }

    // =====================================
    // KIRIM KE FRONTEND
    // =====================================

    return res.status(200).json({
      result: text
    });

  } catch (error) {

    return res.status(500).json({
      error: "Gagal menghubungi AI"
    });
  }
}
