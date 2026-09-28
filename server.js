const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
    console.error("ОШИБКА: не задан OPENAI_API_KEY");
}

// Проверка сервера
app.get("/", (req, res) => {
    res.json({
        status: "ok",
        app: "Bear AI"
    });
});

// Чат Bear AI
app.post("/chat", async (req, res) => {
    try {
        if (!API_KEY) {
            return res.status(500).json({
                error: "API key не настроен на сервере"
            });
        }

        const { message, history = [] } = req.body;

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "Сообщение отсутствует"
            });
        }

        const input = [
            ...history.map(item => ({
                role: item.role,
                content: item.content
            })),
            {
                role: "user",
                content: message
            }
        ];

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-5.6-luna",
                    input: input
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);

            return res.status(response.status).json({
                error: data.error?.message || "Ошибка OpenAI API"
            });
        }

        res.json({
            reply: data.output_text || "Не удалось получить ответ."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Ошибка сервера"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Bear AI server запущен на порту ${PORT}`);
});
