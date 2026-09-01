
export default {
  async fetch(request, env) {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "online",
          message: "JARVIS AI ONLINE",
          apiKeyConfigured: !!env.GEMINI_API_KEY
        }),
        { headers }
      );
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers }
      );
    }

    try {
      const body = await request.json();
      const message = String(body?.message || "").trim();

      if (!message) {
        return new Response(
          JSON.stringify({ error: "Message is required" }),
          { status: 400, headers }
        );
      }

      if (!env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is missing");

        return new Response(
          JSON.stringify({
            error: "GEMINI_API_KEY is not configured"
          }),
          { status: 500, headers }
        );
      }

      const geminiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
          encodeURIComponent(env.GEMINI_API_KEY),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [
                {
                  text:
                    "You are JARVIS, a helpful personal AI assistant. " +
                    "Understand English, Urdu and Roman Urdu. " +
                    "When the user speaks Roman Urdu, reply naturally in Roman Urdu. " +
                    "Keep answers concise and conversational."
                }
              ]
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: message
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await geminiResponse.json();

      console.log("Gemini status:", geminiResponse.status);
      console.log("Gemini response:", JSON.stringify(data));

      if (!geminiResponse.ok) {
        return new Response(
          JSON.stringify({
            error: "Gemini API error",
            status: geminiResponse.status,
            details: data?.error?.message || data
          }),
          {
            status: 500,
            headers
          }
        );
      }

      const reply =
        data?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || "")
          .join("")
          .trim();

      if (!reply) {
        return new Response(
          JSON.stringify({
            error: "Gemini returned no reply",
            details: data
          }),
          { status: 500, headers }
        );
      }

      return new Response(
        JSON.stringify({ reply }),
        { headers }
      );

    } catch (error) {
      console.error("JARVIS SERVER ERROR:", error);

      return new Response(
        JSON.stringify({
          error: "Server error",
          details: error?.message || String(error)
        }),
        { status: 500, headers }
      );
    }
  }
};
