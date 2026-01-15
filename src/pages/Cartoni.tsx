import { Helmet } from "react-helmet";
import { ExternalLink, Wrench, ShoppingBag, Award, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CARTONI_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cartoni_logo.svg/1200px-Cartoni_logo.svg.png";

const Cartoni = () => {
  return (
    <div className="min-h-screen bg-background pt-20">
      <Helmet>
        <title>Cartoni - Seller y Service Oficial | Ala Norte</title>
        <meta
          name="description"
          content="Ala Norte es Seller y Service Oficial de Cartoni en Argentina. Venta, reparación y mantenimiento de trípodes y cabezales profesionales Cartoni."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-foreground text-background border-b border-foreground overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <img
                src={CARTONI_LOGO}
                alt="Cartoni Logo"
                className="h-16 md:h-24 mx-auto bg-background p-4 rounded-lg"
              />
            </div>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-brutal mb-6">
              SELLER & SERVICE
              <br />
              <span className="text-primary">OFICIAL CARTONI</span>
            </h1>
            <p className="text-xl md:text-2xl text-background/80 font-heading mb-8">
              ALA NORTE ES REPRESENTANTE OFICIAL DE CARTONI EN ARGENTINA
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="hero" size="lg">
                <a
                  href="https://www.cartoni.com/dealers/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  VER EN CARTONI.COM <ExternalLink className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/contacto">CONTACTAR</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="border-l border-primary pl-8 mb-12">
            <h2 className="font-heading text-3xl md:text-5xl mb-4">NUESTROS SERVICIOS</h2>
            <p className="text-lg text-muted-foreground font-heading">
              COMO DEALER OFICIAL OFRECEMOS SERVICIOS COMPLETOS
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-foreground p-8 bg-card hover:shadow-brutal transition-shadow">
              <div className="h-16 w-16 bg-primary text-primary-foreground flex items-center justify-center mb-6 border border-foreground">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-2xl mb-4">VENTA</h3>
              <p className="text-muted-foreground">
                Venta oficial de toda la línea de productos Cartoni: trípodes, cabezales fluidos,
                dollies, pedestales y accesorios profesionales para cine y broadcast.
              </p>
            </div>

            <div className="border border-foreground p-8 bg-card hover:shadow-brutal transition-shadow">
              <div className="h-16 w-16 bg-primary text-primary-foreground flex items-center justify-center mb-6 border border-foreground">
                <Wrench className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-2xl mb-4">SERVICE TÉCNICO</h3>
              <p className="text-muted-foreground">
                Servicio técnico autorizado con técnicos certificados. Reparación, mantenimiento
                preventivo y calibración de equipos Cartoni con repuestos originales.
              </p>
            </div>

            <div className="border border-foreground p-8 bg-card hover:shadow-brutal transition-shadow">
              <div className="h-16 w-16 bg-primary text-primary-foreground flex items-center justify-center mb-6 border border-foreground">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-2xl mb-4">GARANTÍA OFICIAL</h3>
              <p className="text-muted-foreground">
                Todos los productos vendidos cuentan con garantía oficial Cartoni.
                Soporte técnico directo y acceso a actualizaciones y mejoras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Cartoni */}
      <section className="py-16 lg:py-24 bg-background border-y border-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="border-l border-primary pl-8 mb-12">
              <h2 className="font-heading text-3xl md:text-5xl mb-4">SOBRE CARTONI</h2>
              <p className="text-lg text-muted-foreground font-heading">
                EXCELENCIA ITALIANA DESDE 1935
              </p>
            </div>

            <div className="prose prose-lg max-w-none text-foreground">
              <p className="text-lg mb-6">
                <strong>Cartoni</strong> es una empresa italiana fundada en 1935, reconocida mundialmente
                por fabricar los mejores soportes de cámara profesionales del mercado. Sus productos
                son utilizados en las producciones cinematográficas y televisivas más importantes del mundo.
              </p>
              <p className="text-lg mb-6">
                Con casi 90 años de experiencia, Cartoni combina la tradición artesanal italiana con
                la más avanzada tecnología para crear trípodes y cabezales que ofrecen precisión,
                suavidad y durabilidad incomparables.
              </p>
              <p className="text-lg">
                Como <strong>Seller y Service Oficial</strong> en Argentina, Ala Norte garantiza el
                acceso a productos originales, precios competitivos y servicio técnico especializado
                para toda la línea Cartoni.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-5xl mb-8">CONTACTANOS</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Para consultas sobre productos Cartoni, cotizaciones o servicio técnico
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span>+54 (11) 4718-0732</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <span>info@alanortecinedigital.com</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Virrey Liniers 1565, Florida, Buenos Aires</span>
              </div>
            </div>

            <Button asChild variant="default" size="lg">
              <Link to="/contacto">ENVIAR CONSULTA</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Cartoni;
