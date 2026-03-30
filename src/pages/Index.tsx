import MockupCard from "@/components/MockupCard";
import mockupBillboard from "@/assets/mockup-billboard.jpg";
import mockupBuilding from "@/assets/mockup-building.jpg";
import mockupStorefront from "@/assets/mockup-storefront.jpg";
import mockupCards from "@/assets/mockup-cards.jpg";
import mockupPackaging from "@/assets/mockup-packaging.jpg";
import mockupMerch from "@/assets/mockup-merch.jpg";

const mockups = [
  {
    image: mockupBillboard,
    title: "Times Square Digital Billboard",
    category: "Billboard",
    description: "Your brand dominates the iconic Times Square skyline — a massive LED display surrounded by the electric energy of the city that never sleeps.",
  },
  {
    image: mockupBuilding,
    title: "Corporate Headquarters",
    category: "Architecture",
    description: "A sleek glass skyscraper at golden hour, crowned with your illuminated logo — the ultimate symbol of corporate ambition and scale.",
  },
  {
    image: mockupStorefront,
    title: "Flagship Retail Storefront",
    category: "Retail",
    description: "A luxury flagship store glowing on a rain-slicked street. Warm light spills through floor-to-ceiling windows as the city moves around it.",
  },
  {
    image: mockupCards,
    title: "Executive Business Cards",
    category: "Print",
    description: "Gold foil embossing on thick cotton stock. Every detail communicates prestige — from the paper grain to the metallic sheen.",
  },
  {
    image: mockupPackaging,
    title: "Premium Product Packaging",
    category: "Packaging",
    description: "The unboxing moment, elevated. Rigid construction, magnetic closure, and soft-touch finish create a tactile brand experience.",
  },
  {
    image: mockupMerch,
    title: "Branded Merchandise",
    category: "Apparel",
    description: "From embroidered hoodies to branded essentials — merchandise that builds culture and community around your brand.",
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
            Six cinematic mockups that show the <span className="text-foreground font-medium">Deal24</span> brand in the places entrepreneurs dream about.
          </p>
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockups.map((mockup, i) => (
            <MockupCard key={mockup.title} {...mockup} index={i} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 text-center">
        <p className="font-body text-xs tracking-widest uppercase text-muted-foreground">
          Deal24 — Your Deals, Delivered
        </p>
      </footer>
    </div>
  );
};

export default Index;
