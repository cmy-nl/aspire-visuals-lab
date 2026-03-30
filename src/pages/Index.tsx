import { useState, useCallback } from "react";
import { toast } from "sonner";
import MockupCard from "@/components/MockupCard";
import { supabase } from "@/integrations/supabase/client";
import mockupBillboard from "@/assets/mockup-billboard.jpg";
import mockupBuilding from "@/assets/mockup-building.jpg";
import mockupStorefront from "@/assets/mockup-storefront.jpg";
import mockupCards from "@/assets/mockup-cards.jpg";
import mockupPackaging from "@/assets/mockup-packaging.jpg";
import mockupMerch from "@/assets/mockup-merch.jpg";

/** Convert an image URL (including SVG) to a PNG base64 data URL via canvas */
function imageUrlToDataUrl(url: string, maxWidth = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      // White background for SVGs with transparency
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/** Convert a local asset import (relative URL) to a base64 data URL */
function assetToDataUrl(assetPath: string, maxWidth = 1024): Promise<string> {
  const fullUrl = new URL(assetPath, window.location.origin).href;
  return imageUrlToDataUrl(fullUrl, maxWidth);
}

const mockups = [
  {
    image: mockupBillboard,
    title: "Times Square Digital Billboard",
    category: "Billboard",
    description:
      "Your brand dominates the iconic Times Square skyline — a massive LED display surrounded by the electric energy of the city that never sleeps.",
    prompt:
      "Take the second image (a logo) and place it prominently on the blank white LED billboard screen in the first image. The logo should be centered on the billboard, large and clearly visible, with a subtle LED glow effect. Make it look like the logo is actually being displayed on the digital screen. Keep the rest of the scene exactly as is.",
  },
  {
    image: mockupBuilding,
    title: "Corporate Headquarters",
    category: "Architecture",
    description:
      "A sleek glass skyscraper at golden hour, crowned with your illuminated logo — the ultimate symbol of corporate ambition and scale.",
    prompt:
      "Take the second image (a logo) and place it on the blank white illuminated sign panel on the upper portion of the skyscraper in the first image. The logo should appear as a large backlit building sign, glowing white against the glass facade. Make it look realistic with proper lighting matching the golden hour scene. Keep the rest of the scene exactly as is.",
  },
  {
    image: mockupStorefront,
    title: "Flagship Retail Storefront",
    category: "Retail",
    description:
      "A luxury flagship store glowing on a rain-slicked street. Warm light spills through floor-to-ceiling windows as the city moves around it.",
    prompt:
      "Take the second image (a logo) and place it on the blank white illuminated sign panel above the store entrance in the first image. The logo should appear as a premium backlit storefront sign, glowing warmly. Make it look realistic and properly lit to match the nighttime scene. Keep the rest of the scene exactly as is.",
  },
  {
    image: mockupCards,
    title: "Executive Business Cards",
    category: "Print",
    description:
      "Gold foil embossing on thick cotton stock. Every detail communicates prestige — from the paper grain to the metallic sheen.",
    prompt:
      "Take the second image (a logo) and place it centered on the blank white face of the top business card in the first image. The logo should appear embossed or printed on the card with a subtle gold foil effect, matching the premium aesthetic. Make it look like the logo is actually printed on the card with proper perspective and shadows. Keep the rest of the scene exactly as is.",
  },
  {
    image: mockupPackaging,
    title: "Premium Product Packaging",
    category: "Packaging",
    description:
      "The unboxing moment, elevated. Rigid construction, magnetic closure, and soft-touch finish create a tactile brand experience.",
    prompt:
      "Take the second image (a logo) and place it centered on the white lid of the product packaging box in the first image. The logo should appear printed or embossed on the box lid, with proper perspective matching the box angle. Make it look realistic with subtle shadows. Keep the rest of the scene exactly as is.",
  },
  {
    image: mockupMerch,
    title: "Branded Merchandise",
    category: "Apparel",
    description:
      "From embroidered hoodies to branded essentials — merchandise that builds culture and community around your brand.",
    prompt:
      "Take the second image (a logo) and place it on the upper chest area of the black hoodie in the first image. The logo should appear as a white or light-colored embroidered patch or screen print, clearly visible against the dark fabric. Make it look like a realistic embroidered or printed logo on clothing. Keep the rest of the scene exactly as is.",
  },
];

const Index = () => {
  const [logoUrl, setLogoUrl] = useState(
    "https://brandforge.com/wp-content/themes/brandforge-theme/images/shared/main-logo-lite.svg"
  );
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [generatingIndexes, setGeneratingIndexes] = useState<Set<number>>(new Set());
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const generateSingleMockup = useCallback(
    async (index: number) => {
      if (!logoUrl.trim()) {
        toast.error("Please enter a logo URL first");
        return;
      }

      setGeneratingIndexes((prev) => new Set(prev).add(index));

      try {
        const mockup = mockups[index];

        // Convert both images to base64 data URLs on the client
        // This handles SVGs by rasterizing them via canvas
        const [baseImageDataUrl, logoDataUrl] = await Promise.all([
          assetToDataUrl(mockup.image, 1024),
          imageUrlToDataUrl(logoUrl.trim(), 512),
        ]);

        const { data, error } = await supabase.functions.invoke("generate-mockup", {
          body: {
            baseImageDataUrl,
            logoDataUrl,
            prompt: mockup.prompt,
          },
        });

        if (error) throw error;

        if (data?.error) {
          throw new Error(data.error);
        }

        if (data?.imageData) {
          setGeneratedImages((prev) => ({ ...prev, [index]: data.imageData }));
          toast.success(`${mockup.title} generated!`);
        }
      } catch (err: any) {
        console.error(`Failed to generate mockup ${index}:`, err);
        toast.error(`Failed: ${err.message || "Unknown error"}`);
      } finally {
        setGeneratingIndexes((prev) => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
      }
    },
    [logoUrl]
  );

  const generateAll = useCallback(async () => {
    if (!logoUrl.trim()) {
      toast.error("Please enter a logo URL first");
      return;
    }

    setIsGeneratingAll(true);
    toast.info("Generating all 6 mockups — this takes about 30-60 seconds…");

    for (let i = 0; i < mockups.length; i++) {
      await generateSingleMockup(i);
      if (i < mockups.length - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    setIsGeneratingAll(false);
    toast.success("All mockups generated!");
  }, [logoUrl, generateSingleMockup]);

  const resetAll = () => {
    setGeneratedImages({});
    toast.info("Reset to blank mockups");
  };

  return (
    <div className="min-h-screen bg-hero-gradient">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Hero */}
      <header className="relative py-24 md:py-32 px-6 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(40 60% 55%) 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <p
            className="font-body text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6"
            style={{
              animation: "fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0ms forwards",
              opacity: 0,
            }}
          >
            BrandForge Mockup Gallery
          </p>
          <h1
            className="font-display text-5xl md:text-7xl font-bold text-gradient-gold mb-6 leading-[1.1]"
            style={{
              animation: "fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 100ms forwards",
              opacity: 0,
            }}
          >
            Where Will Your Logo Live?
          </h1>
          <p
            className="font-body text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10"
            style={{
              animation: "fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 200ms forwards",
              opacity: 0,
            }}
          >
            Paste your logo URL and watch AI place it into six cinematic real-world
            mockups.
          </p>

          {/* Logo URL input + Generate */}
          <div
            className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3"
            style={{
              animation: "fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 300ms forwards",
              opacity: 0,
            }}
          >
            <input
              type="url"
              placeholder="Paste your logo SVG/PNG URL…"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="flex-1 px-5 py-3.5 rounded-xl bg-card border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button
              onClick={generateAll}
              disabled={isGeneratingAll || !logoUrl.trim()}
              className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-sm tracking-wide uppercase transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isGeneratingAll ? "Generating…" : "Generate All"}
            </button>
            {Object.keys(generatedImages).length > 0 && (
              <button
                onClick={resetAll}
                className="px-6 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-body font-medium text-sm tracking-wide uppercase transition-all hover:brightness-110 whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>

          {/* Logo preview */}
          {logoUrl.trim() && (
            <div
              className="mt-6 flex items-center justify-center gap-3"
              style={{
                animation: "fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) 400ms forwards",
                opacity: 0,
              }}
            >
              <span className="font-body text-xs text-muted-foreground uppercase tracking-widest">
                Logo preview:
              </span>
              <div className="h-10 px-4 py-1 bg-card/50 border border-border rounded-lg flex items-center">
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="h-full w-auto max-w-[200px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockups.map((mockup, i) => (
            <div key={mockup.title} className="relative">
              <MockupCard
                image={mockup.image}
                generatedImage={generatedImages[i] || null}
                title={mockup.title}
                category={mockup.category}
                description={mockup.description}
                index={i}
                isGenerating={generatingIndexes.has(i)}
              />
              {!generatedImages[i] && !generatingIndexes.has(i) && (
                <button
                  onClick={() => generateSingleMockup(i)}
                  disabled={!logoUrl.trim() || isGeneratingAll}
                  className="absolute bottom-24 right-6 px-4 py-2 rounded-lg bg-primary/90 text-primary-foreground font-body text-xs font-medium tracking-wide uppercase transition-all hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed z-20"
                >
                  Generate
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 text-center">
        <p className="font-body text-xs tracking-widest uppercase text-muted-foreground">
          BrandForge — Mockup Gallery
        </p>
      </footer>
    </div>
  );
};

export default Index;
