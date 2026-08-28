export default {
  async fetch(request, env) {
    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    };

    // Test
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "online",
          message: "JARVIS AI ONLINE"
        }),
        { headers }
      );
    }

    // Chat endpoint
    if (request.method === "POST") {
      try {
        const body = await request.json();
        const message = body.message;

        if (!message) {
          return new Response(
            JSON.stringify({ error: "Message is required" }),
            { status: 400, headers }
          );
        }

        if (!env.GEMINI_API_KEY) {
          return new Response(
            JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
            { status: 500, headers }
          );
        }

        const response = await fetch(
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
                      "Answer accurately and clearly. " +
                      "Keep normal answers concise and conversational. " +
                      "Do not claim to have performed an action unless you actually performed it."
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

        const data = await response.json();

        if (!response.ok) {
          return new Response(
            JSON.stringify({
              error: "Gemini API error",
              details: data
            }),
            { status: 500, headers }
          );
        }

        const reply =
          data?.candidates?.[0]?.content?.parts
            ?.map((part) => part.text || "")
            .join("")
            .trim() || "Sorry, mujhe jawab nahi mila.";

        return new Response(
          JSON.stringify({
            reply
          }),
          { headers }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "Server error",
            details: error.message
          }),
          { status: 500, headers }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers
      }
    );
  }
};
