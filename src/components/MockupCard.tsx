import { useState } from "react";

interface MockupCardProps {
  image: string;
  generatedImage?: string | null;
  title: string;
  category: string;
  description: string;
  index: number;
  isGenerating?: boolean;
}

const MockupCard = ({
  image,
  generatedImage,
  title,
  category,
  description,
  index,
  isGenerating,
}: MockupCardProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const displayImage = generatedImage || image;

  return (
    <div
      className="mockup-card group cursor-pointer"
      style={{
        animationDelay: `${index * 120}ms`,
        opacity: 0,
        animation: `fadeSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${index * 120}ms forwards`,
      }}
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        <img
          src={displayImage}
          alt={title}
          loading={index === 0 ? undefined : "lazy"}
          width={1920}
          height={1320}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Generating overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="font-body text-xs tracking-widest uppercase text-primary">
                Generating…
              </span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="absolute top-4 left-4 px-3 py-1 text-xs font-body font-medium tracking-widest uppercase bg-primary/90 text-primary-foreground rounded-full z-10">
          {category}
        </span>
        {generatedImage && (
          <span className="absolute top-4 right-4 px-3 py-1 text-xs font-body font-medium tracking-widest uppercase bg-green-600/90 text-white rounded-full z-10">
            AI Generated
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-gradient-gold transition-colors">
          {title}
        </h3>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default MockupCard;
