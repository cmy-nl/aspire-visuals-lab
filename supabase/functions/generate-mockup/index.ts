import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { render } from "jsr:@nick/resvg";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const textDecoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

function toPngDataUrl(bytes: Uint8Array, mimeType = "image/png") {
  return `data:${mimeType};base64,${bytesToBase64(bytes)}`;
}

async function logoUrlToRasterDataUrl(logoUrl: string): Promise<string> {
  const logoResponse = await fetch(logoUrl);
  if (!logoResponse.ok) {
    throw new Error(`Failed to fetch logo: ${logoResponse.status}`);
  }

  const logoBytes = new Uint8Array(await logoResponse.arrayBuffer());
  const contentType = logoResponse.headers.get("content-type")?.toLowerCase() ?? "";
  const svgText = textDecoder.decode(logoBytes).trimStart();
  const isSvg =
    contentType.includes("image/svg") ||
    contentType.includes("text/xml") ||
    svgText.startsWith("<svg") ||
    svgText.startsWith("<?xml");

  if (isSvg) {
    const pngBytes = render(svgText, {
      fitTo: {
        mode: "width",
        value: 1200,
      },
      background: "rgba(255, 255, 255, 0)",
    });

    return toPngDataUrl(pngBytes, "image/png");
  }

  return toPngDataUrl(logoBytes, contentType || "image/png");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { baseImageDataUrl, logoUrl, prompt } = await req.json();

    if (!baseImageDataUrl || !logoUrl || !prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: baseImageDataUrl, logoUrl, prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Calling AI gateway with model: google/gemini-3.1-flash-image-preview");
    console.log("Base image data URL length:", baseImageDataUrl.length);

    const logoDataUrl = await logoUrlToRasterDataUrl(logoUrl);
    console.log("Logo data URL length:", logoDataUrl.length);

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
                image_url: { url: baseImageDataUrl },
              },
              {
                type: "image_url",
                image_url: { url: logoDataUrl },
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

    return new Response(JSON.stringify({ imageData: generatedImageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-mockup error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
