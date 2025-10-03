// Cloudflare Worker to proxy GraphQL requests
// Deploy this at: https://workers.cloudflare.com/

export default {
  async fetch(request, env) {
    // Only allow POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Only allow requests from your domain (configure this!)
    const allowedOrigins = [
      "https://yashmalik.tech",
      "https://codeblech.github.io",
      "http://localhost:5173", // for local testing
    ];

    const origin = request.headers.get("Origin");

    // Check if origin is allowed
    if (!allowedOrigins.includes(origin)) {
      return new Response("Forbidden", { status: 403 });
    }

    try {
      // Get the request body
      const body = await request.json();

      // Forward to Cloudflare API
      const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, // Set this in Worker secrets
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // Return with CORS headers
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
        },
      });
    }
  },
};
