import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockEquipment, categoryNames, statusNames, statusColors } from "@/lib/mockData";
import equipmentHero from "@/assets/equipment-hero.jpg";

const Equipos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredEquipment = mockEquipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section
        className="relative h-[50vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${equipmentHero})` }}
      >
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 container mx-auto px-4 text-center text-background">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-4">
            Nuestros Equipos
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Equipamiento profesional de primer nivel para tus producciones
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar equipos por nombre o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[240px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Object.entries(categoryNames).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Equipment Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredEquipment.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No se encontraron equipos con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipment.map((equipment) => (
                <Card
                  key={equipment.id}
                  className="hover-lift transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={equipment.imageUrl}
                      alt={equipment.name}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <Badge
                      className={`absolute top-2 right-2 ${statusColors[equipment.status]} text-white`}
                    >
                      {statusNames[equipment.status]}
                    </Badge>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">
                        {categoryNames[equipment.category]}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{equipment.name}</CardTitle>
                    <CardDescription>
                      {equipment.brand} {equipment.model}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {equipment.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Día:</span>
                        <span className="font-semibold text-primary">
                          ${equipment.pricePerDay.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Semana:</span>
                        <span className="font-semibold text-primary">
                          ${equipment.pricePerWeek.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button
                      variant="hero"
                      className="flex-1"
                      disabled={equipment.status !== "available"}
                    >
                      Agregar a cotización
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Equipos;
