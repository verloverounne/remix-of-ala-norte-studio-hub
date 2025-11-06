import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Fuse from "fuse.js";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  type: 'equipment' | 'space' | 'page';
  title: string;
  description?: string;
  url: string;
}

export const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchData, setSearchData] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSearchData = async () => {
      // Fetch equipment
      const { data: equipment } = await supabase
        .from('equipment')
        .select('id, name, description, brand, model')
        .eq('status', 'available');

      // Fetch spaces
      const { data: spaces } = await supabase
        .from('spaces')
        .select('id, name, description, slug')
        .eq('status', 'available');

      const data: SearchResult[] = [
        // Static pages
        { type: 'page', title: 'Inicio', url: '/' },
        { type: 'page', title: 'Equipos', description: 'Explora nuestro catálogo de equipos profesionales', url: '/equipos' },
        { type: 'page', title: 'Espacios', description: 'Descubre nuestros espacios de producción', url: '/espacios' },
        { type: 'page', title: 'Servicios', description: 'Servicios de producción audiovisual', url: '/servicios' },
        { type: 'page', title: 'Comunidad', description: 'Blog y recursos para la comunidad', url: '/comunidad' },
        { type: 'page', title: 'Soporte', description: 'Centro de ayuda y contacto', url: '/soporte' },
        { type: 'page', title: 'Nosotros', description: 'Conoce al equipo de Ala Norte', url: '/nosotros' },
        { type: 'page', title: 'Cotizador', description: 'Solicita tu cotización', url: '/cotizador' },
        // Equipment
        ...(equipment || []).map(e => ({
          type: 'equipment' as const,
          title: `${e.name}${e.brand ? ` - ${e.brand}` : ''}${e.model ? ` ${e.model}` : ''}`,
          description: e.description || undefined,
          url: `/equipos?item=${e.id}`
        })),
        // Spaces
        ...(spaces || []).map(s => ({
          type: 'space' as const,
          title: s.name,
          description: s.description || undefined,
          url: `/espacios?space=${s.slug}`
        }))
      ];

      setSearchData(data);
    };

    loadSearchData();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const fuse = new Fuse(searchData, {
      keys: ['title', 'description'],
      threshold: 0.3,
      includeScore: true
    });

    const searchResults = fuse.search(query);
    setResults(searchResults.slice(0, 8).map(r => r.item));
  }, [query, searchData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (url: string) => {
    navigate(url);
    setIsOpen(false);
    setQuery("");
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'equipment': return 'Equipo';
      case 'space': return 'Espacio';
      case 'page': return 'Página';
      default: return '';
    }
  };

  return (
    <div ref={searchRef} className="relative">
      {!isOpen ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="border-2 border-foreground h-12 w-12"
          aria-label="Abrir búsqueda"
        >
          <Search className="h-5 w-5" />
        </Button>
      ) : (
        <div className="absolute right-0 top-0 w-80 bg-background border-2 border-foreground shadow-brutal-lg z-50">
          <div className="flex items-center gap-2 p-3 border-b-2 border-foreground">
            <Search className="h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {results.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result.url)}
                  className="w-full text-left p-3 hover:bg-muted border-b border-foreground/20 last:border-0 transition-none"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-semibold truncate">
                        {result.title}
                      </p>
                      {result.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {result.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 font-heading shrink-0">
                      {getTypeLabel(result.type)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {query.trim().length >= 2 && results.length === 0 && (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No se encontraron resultados
            </div>
          )}
        </div>
      )}
    </div>
  );
};
