import { useState } from "react";

interface MockupCardProps {
  image: string;
  title: string;
  category: string;
  description: string;
  index: number;
}

const MockupCard = ({ image, title, category, description, index }: MockupCardProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

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
          src={image}
          alt={title}
          loading={index === 0 ? undefined : "lazy"}
          width={1920}
          height={1320}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="absolute top-4 left-4 px-3 py-1 text-xs font-body font-medium tracking-widest uppercase bg-primary/90 text-primary-foreground rounded-full">
          {category}
        </span>
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
