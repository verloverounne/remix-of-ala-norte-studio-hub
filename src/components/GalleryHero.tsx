import { useState, useRef } from "react";
import { Calendar, ArrowRight, MapPin, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import type { Space } from "@/types/supabase";
interface GalleryHeroProps {
  space: Space;
}
export const GalleryHero = ({
  space
}: GalleryHeroProps) => {
  const [muted, setMuted] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const videoRef = useRef<HTMLVideoElement>(null);
  return <section className="relative min-h-screen pt-0 flex items-center bg-background">
      {" "}
      {/* Desktop: 2 Column Layout */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8 w-full h-screen">
        {/* Left Column: Text Content */}
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-center">
          <div className="space-y-6 w-full">
            {/* <Badge variant="secondary" className="text-lg px-4 py-2">
              <Clock className="mr-2 h-4 w-4" />
              BLOQUES DE {space.block_hours || 4}HS
             </Badge>*/}
            <div className="flex flex-col items-start gap-[24px] my-0 mb-[64px]">
              <div className="flex items-center justify-center gap-2 text-primary px-4 py-2 rounded-lg w-full max-w-fit bg-foreground">
                <span className="text-2xl font-bold font-heading text-background sm:text-xl">
                  ${(space.block_price || space.price)?.toLocaleString()}
                </span>
                <span className="text-2x1 opacity-100 text-background text-sm">/ bloque {space.block_hours || 4}hs</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground lg:text-8xl">
                {space.hero_title || space.name}
              </h1>
              {space.location && <div className="flex items-left gap-2 px-4 py-2 rounded-lg border-2 bg-background border-foreground border-solid">
                  <MapPin className="h-5 w-5 text-input" />
                  <span className="font-heading text-foreground">{space.location}</span>
                </div>}
              <p className="text-sm sm:text-base max-w-2xl font-heading leading-tight font-bold my-[64px] text-foreground md:text-2xl mb-[32px]">
                {space.hero_subtitle || space.description}
              </p>
            </div>

            {/* Features inline - 2 columns, no borders */}
            {space.features && Array.isArray(space.features) && space.features.length > 0 && <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-[48px]">
                {(space.features as string[]).map((feature, index) => <p key={index} className="text-sm text-muted-foreground font-heading flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {feature}
                  </p>)}
              </div>}
            {space.discount_text && <div className="inline-flex items-center gap-2 border-2 border-primary px-4 py-2 rounded-none">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-heading font-bold text-primary text-xl">{space.discount_text}</span>
              </div>}

            {/* CTA Button */}
            <div>
              <Button variant="default" size="lg" asChild className="text-lg w-full max-w-fit">
                <Link to="/contacto">
                  <Calendar className="mr-2 h-5 w-5" />
                  {space.cta_text || "RESERVAR BLOQUE"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Vertical Video - Full Width and Height */}
        {space.video_url ? <div className="relative w-full h-full overflow-hidden duotone-hover-group">
            <video src={space.video_url} className="w-full h-full object-cover video-duotone" autoPlay loop muted={muted} playsInline />
            <button onClick={() => setMuted(!muted)} className="absolute top-4 right-4 z-20 p-3 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background/90 transition-colors" aria-label={muted ? "Activar sonido" : "Silenciar"}>
              {muted ? <VolumeX className="h-5 w-5 text-foreground" /> : <Volume2 className="h-5 w-5 text-foreground" />}
            </button>
          </div> : <div className="relative w-full h-full bg-muted flex items-center justify-center">
            <p className="text-muted-foreground font-heading">Video no disponible</p>
          </div>}
      </div>
      {/* Mobile: Horizontal Slider */}
      <div className="lg:hidden w-full h-screen overflow-hidden">
        <Carousel className="w-full h-full" setApi={setApi} opts={{
        loop: false,
        align: "start",
        dragFree: true,
        containScroll: "trimSnaps"
      }}>
          <CarouselContent className="-ml-0 h-full flex">
            {/* Slide 1: Text Content - Same as desktop left column */}
            <CarouselItem className="pl-0 basis-full shrink-0 grow-0 w-screen h-full flex items-center justify-center">
              <div className="container mx-auto space-y-4 my-[60px] px-[32px] py-[64px] rounded-none">
                {/* Price Badge */}
                <div className="gap-2 text-primary px-4 py-2 rounded-lg w-full max-w-fit bg-card-foreground flex-row flex items-center justify-center">
                  <span className="sm:text-2xl font-bold font-heading text-background text-base">
                    ${(space.block_price || space.price)?.toLocaleString()}
                  </span>
                  <span className="opacity-100 text-background font-extralight text-xs">/ bloque {space.block_hours || 4}hs</span>
                </div>

                {/* Title + Location + Subtitle */}
                <div className="flex-wrap gap-3 flex-col py-[64px] pb-[24px] flex items-center justify-center">
                  <h1 className="sm:text-6xl font-heading font-bold text-foreground my-0 mt-[32px] text-6xl text-center">
                    {space.hero_title || space.name}
                  </h1>
                  {space.location && <div className="items-left gap-2 rounded-lg border-2 bg-background border-foreground border-solid py-[6px] px-[6px] my-0 mb-[64px] flex items-start justify-start">
                      <MapPin className="h-4 w-4 text-input" />
                      <span className="font-heading text-foreground text-sm">{space.location}</span>
                    </div>}
                  <p className="max-w-2xl font-heading text-muted-foreground leading-tight px-0 py-0 font-bold text-center text-3xl mb-[24px]">
                    {space.hero_subtitle || space.description}
                  </p>
                </div>

                {/* Features - 2 columns */}
                {space.features && Array.isArray(space.features) && space.features.length > 0 && <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-[24px]">
                    {(space.features as string[]).map((feature, index) => <p key={index} className="text-xs text-muted-foreground font-heading flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {feature}
                      </p>)}
                  </div>}

                {/* Discount Text */}
                {space.discount_text && <div className="inline-flex items-center gap-2 border-2 border-primary px-3 py-1.5 rounded-lg">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-heading font-bold text-primary text-sm">{space.discount_text}</span>
                  </div>}

                {/* CTA Button */}
                <div>
                  <Button variant="default" size="lg" asChild className="text-base w-full max-w-fit">
                    <Link to="/contacto">
                      <Calendar className="mr-2 h-4 w-4" />
                      {space.cta_text || "RESERVAR BLOQUE"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>

            {/* Slide 2: Video */}
            {space.video_url && <CarouselItem className="pl-0 basis-full shrink-0 grow-0 w-screen h-full flex items-center justify-center">
                <div className="relative w-full h-full duotone-hover-group">
                  <video src={space.video_url} className="w-full h-full object-cover video-duotone" autoPlay loop muted={muted} playsInline ref={videoRef} />
                  <button onClick={() => setMuted(!muted)} className="absolute top-4 right-4 z-20 p-3 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background/90 transition-colors" aria-label={muted ? "Activar sonido" : "Silenciar"}>
                    {muted ? <VolumeX className="h-5 w-5 text-foreground" /> : <Volume2 className="h-5 w-5 text-foreground" />}
                  </button>
                </div>
              </CarouselItem>}
          </CarouselContent>
        </Carousel>

        {/* Navigation dots for mobile */}
        {space.video_url && <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            <button onClick={() => api?.scrollTo(0)} className="h-2 w-2 rounded-full bg-primary transition-all" aria-label="Ir a texto" />
            <button onClick={() => api?.scrollTo(1)} className="h-2 w-2 rounded-full bg-background/40 transition-all" aria-label="Ir a video" />
          </div>}
      </div>
    </section>;
};