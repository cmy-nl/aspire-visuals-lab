import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { baseImageUrl, logoUrl, prompt } = await req.json();

    if (!baseImageUrl || !logoUrl || !prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: baseImageUrl, logoUrl, prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch both images and convert to base64
    const [baseImageResp, logoResp] = await Promise.all([
      fetch(baseImageUrl),
      fetch(logoUrl),
    ]);

    if (!baseImageResp.ok) {
      throw new Error(`Failed to fetch base image: ${baseImageResp.status}`);
    }
    if (!logoResp.ok) {
      throw new Error(`Failed to fetch logo: ${logoResp.status}`);
    }

    const baseImageBuffer = await baseImageResp.arrayBuffer();
    const logoBuffer = await logoResp.arrayBuffer();

    const baseImageB64 = btoa(
      new Uint8Array(baseImageBuffer).reduce((s, b) => s + String.fromCharCode(b), "")
    );
    const logoB64 = btoa(
      new Uint8Array(logoBuffer).reduce((s, b) => s + String.fromCharCode(b), "")
    );

    // Detect content types
    const baseContentType = baseImageResp.headers.get("content-type") || "image/jpeg";
    const logoContentType = logoResp.headers.get("content-type") || "image/svg+xml";

    // Call AI image editing with both images
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${baseContentType};base64,${baseImageB64}`,
                },
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${logoContentType};base64,${logoB64}`,
                },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted. Please add funds at Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedImageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error("No image in AI response:", JSON.stringify(aiData).slice(0, 500));
      throw new Error("AI did not return an image");
    }

    return new Response(
      JSON.stringify({ imageData: generatedImageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-mockup error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
