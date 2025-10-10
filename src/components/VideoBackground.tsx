import heroBackground from "@/assets/hero-background.jpg";

export const VideoBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated background image as fallback/enhancement */}
      <div 
        className="absolute inset-0 bg-cover bg-center animate-[pulse_8s_ease-in-out_infinite]"
        style={{ 
          backgroundImage: `url(${heroBackground})`,
          filter: 'brightness(0.4) saturate(1.2)',
        }}
      />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/60" />
      
      {/* Animated eco particles effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite_2s]" />
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-[pulse_7s_ease-in-out_infinite_1s]" />
      </div>
    </div>
  );
};
