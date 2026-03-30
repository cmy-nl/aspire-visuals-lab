import MockupCard from "@/components/MockupCard";
import mockupBillboard from "@/assets/mockup-billboard.jpg";
import mockupBuilding from "@/assets/mockup-building.jpg";
import mockupStorefront from "@/assets/mockup-storefront.jpg";
import mockupCards from "@/assets/mockup-cards.jpg";
import mockupPackaging from "@/assets/mockup-packaging.jpg";
import mockupMerch from "@/assets/mockup-merch.jpg";

// ✅ Change this URL to swap the brand across all mockups
const LOGO_URL = "https://brandforge.com/wp-content/themes/brandforge-theme/images/shared/main-logo-lite.svg";

const mockups = [
  {
    image: mockupBillboard,
    title: "Times Square Digital Billboard",
    category: "Billboard",
    description: "Your brand dominates the iconic Times Square skyline — a massive LED display surrounded by the electric energy of the city that never sleeps.",
    overlay: {
      top: "18%",
      left: "50%",
      width: "45%",
      maxHeight: "30%",
      transform: "translateX(-50%)",
      opacity: 0.95,
      filter: "brightness(1.2) drop-shadow(0 0 40px rgba(255,255,255,0.5))",
    },
  },
  {
    image: mockupBuilding,
    title: "Corporate Headquarters",
    category: "Architecture",
    description: "A sleek glass skyscraper at golden hour, crowned with your illuminated logo — the ultimate symbol of corporate ambition and scale.",
    overlay: {
      top: "8%",
      left: "8%",
      width: "42%",
      maxHeight: "22%",
      opacity: 0.9,
      filter: "brightness(1.2) drop-shadow(0 0 20px rgba(255,255,255,0.3))",
    },
  },
  {
    image: mockupStorefront,
    title: "Flagship Retail Storefront",
    category: "Retail",
    description: "A luxury flagship store glowing on a rain-slicked street. Warm light spills through floor-to-ceiling windows as the city moves around it.",
    overlay: {
      top: "8%",
      left: "50%",
      width: "35%",
      maxHeight: "18%",
      transform: "translateX(-50%)",
      opacity: 0.95,
      filter: "brightness(1.15) drop-shadow(0 0 15px rgba(255,255,255,0.5))",
    },
  },
  {
    image: mockupCards,
    title: "Executive Business Cards",
    category: "Print",
    description: "Gold foil embossing on thick cotton stock. Every detail communicates prestige — from the paper grain to the metallic sheen.",
    overlay: {
      top: "22%",
      left: "28%",
      width: "30%",
      maxHeight: "25%",
      opacity: 0.7,
      blendMode: "multiply",
      filter: "contrast(1.2)",
    },
  },
  {
    image: mockupPackaging,
    title: "Premium Product Packaging",
    category: "Packaging",
    description: "The unboxing moment, elevated. Rigid construction, magnetic closure, and soft-touch finish create a tactile brand experience.",
    overlay: {
      top: "12%",
      left: "38%",
      width: "35%",
      maxHeight: "25%",
      transform: "perspective(800px) rotateX(5deg) rotateY(-15deg)",
      opacity: 0.65,
      blendMode: "multiply",
    },
  },
  {
    image: mockupMerch,
    title: "Branded Merchandise",
    category: "Apparel",
    description: "From embroidered hoodies to branded essentials — merchandise that builds culture and community around your brand.",
    overlay: {
      top: "28%",
      left: "50%",
      width: "28%",
      maxHeight: "20%",
      transform: "translateX(-50%)",
      opacity: 0.75,
      blendMode: "screen",
      filter: "brightness(1.3)",
    },
  },
];

const Index = () => {
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
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(40 60% 55%) 1px, transparent 0)',
          backgroundSize: '48px 48px'
        }} />
        <div className="relative max-w-3xl mx-auto">
          <p className="font-body text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6"
             style={{ animation: 'fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0ms forwards', opacity: 0 }}>
            BrandForge Mockup Gallery
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-gradient-gold mb-6 leading-[1.1]"
              style={{ animation: 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 100ms forwards', opacity: 0 }}>
            Where Will Your Logo Live?
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
             style={{ animation: 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 200ms forwards', opacity: 0 }}>
            Six cinematic mockups that show your brand in the places entrepreneurs dream about.
          </p>
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockups.map((mockup, i) => (
            <MockupCard key={mockup.title} {...mockup} logoUrl={LOGO_URL} index={i} />
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
