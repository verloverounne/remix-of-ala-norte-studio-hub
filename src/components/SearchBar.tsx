import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Fuse from "fuse.js";
import { supabase } from "@/integrations/supabase/client";
interface SearchResult {
  type: 'equipment' | 'space' | 'page';
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  price?: number;
  availability?: string;
}
export const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchData, setSearchData] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const loadSearchData = async () => {
      setLoading(true);
      // Fetch equipment
      const {
        data: equipment
      } = await supabase.from('equipment').select('id, name, description, brand, model, price_per_day, status, image_url').eq('status', 'available');

      // Fetch spaces
      const {
        data: spaces
      } = await supabase.from('spaces').select('id, name, description, slug').eq('status', 'available');
      const data: SearchResult[] = [
      // Static pages
      {
        type: 'page',
        title: 'Inicio',
        url: '/'
      }, {
        type: 'page',
        title: 'Equipos',
        description: 'Explora nuestro catálogo de equipos profesionales',
        url: '/equipos'
      }, {
        type: 'page',
        title: 'Espacios',
        description: 'Descubre nuestros espacios de producción',
        url: '/espacios'
      }, {
        type: 'page',
        title: 'Servicios',
        description: 'Servicios de producción audiovisual',
        url: '/servicios'
      }, {
        type: 'page',
        title: 'Comunidad',
        description: 'Blog y recursos para la comunidad',
        url: '/comunidad'
      }, {
        type: 'page',
        title: 'Soporte',
        description: 'Centro de ayuda y contacto',
        url: '/soporte'
      }, {
        type: 'page',
        title: 'Nosotros',
        description: 'Conoce al equipo de Ala Norte',
        url: '/nosotros'
      }, {
        type: 'page',
        title: 'Cotizador',
        description: 'Solicita tu cotización',
        url: '/cotizador'
      },
      // Equipment
      ...(equipment || []).map(e => ({
        type: 'equipment' as const,
        title: `${e.name}${e.brand ? ` - ${e.brand}` : ''}${e.model ? ` ${e.model}` : ''}`,
        description: e.description || undefined,
        url: `/equipos?item=${e.id}`,
        imageUrl: e.image_url || undefined,
        price: e.price_per_day,
        availability: e.status
      })),
      // Spaces
      ...(spaces || []).map(s => ({
        type: 'space' as const,
        title: s.name,
        description: s.description || undefined,
        url: `/espacios?space=${s.slug}`
      }))];
      setSearchData(data);
      setLoading(false);
    };
    loadSearchData();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }
    const timer = setTimeout(() => {
      const fuse = new Fuse(searchData, {
        keys: ['title', 'description'],
        threshold: 0.3,
        includeScore: true
      });
      const searchResults = fuse.search(query);
      setResults(searchResults.slice(0, 8).map(r => r.item));
      setSelectedIndex(-1);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query, searchData]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleResultClick = (url: string) => {
    navigate(url);
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(-1);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => prev < results.length - 1 ? prev + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : results.length - 1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleResultClick(results[selectedIndex].url);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return <>
        {parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ? <mark key={i} className="bg-primary/30 font-semibold">
              {part}
            </mark> : part)}
      </>;
  };
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'equipment':
        return 'Equipo';
      case 'space':
        return 'Espacio';
      case 'page':
        return 'Página';
      default:
        return '';
    }
  };
  return <div ref={searchRef} className="relative">
      {!isOpen ? <Button variant="ghost" size="icon" onClick={() => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }} className="h-10 w-10 xl:h-12 xl:w-12 rounded-0 rounded-none bg-inherit" aria-label="Abrir búsqueda">
          <Search className="h-4 w-4 xl:h-5 xl:w-5" />
        </Button> : <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto sm:right-0 top-20 sm:top-0 w-auto sm:w-80 md:w-96 border border-foreground shadow-brutal-lg z-50 bg-transparent">
          <div className="flex items-center gap-2 p-3 border-b border-foreground bg-transparent">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <Input ref={inputRef} type="text" placeholder="Buscar equipos, espacios..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown} autoFocus className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
            <Button variant="ghost" size="icon" onClick={() => {
          setIsOpen(false);
          setQuery("");
          setSelectedIndex(-1);
        }} className="h-8 w-8 shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {query.trim().length >= 2 && results.length > 0 && <div className="max-h-96 overflow-y-auto">
              {results.map((result, index) => {
          const isEquipment = result.type === 'equipment';
          return <button key={index} onClick={() => handleResultClick(result.url)} className={`w-full text-left p-3 border-b border-foreground/20 last:border-0 transition-colors ${selectedIndex === index ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                    <div className="flex items-start gap-3">
                      {isEquipment && result.imageUrl && <div className="w-12 h-12 shrink-0 bg-muted border border-foreground rounded overflow-hidden">
                          <img src={result.imageUrl} alt="" className="w-full h-full object-cover grayscale" />
                        </div>}
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-heading text-sm font-semibold truncate">
                          {highlightMatch(result.title, query)}
                        </p>
                        {result.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {result.description}
                          </p>}
                        {isEquipment && result.price && <p className="text-xs text-primary font-mono mt-1">
                            ${(result.price / 1000).toFixed(0)}K/día
                          </p>}
                      </div>
                      
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {getTypeLabel(result.type)}
                      </Badge>
                    </div>
                  </button>;
        })}
            </div>}
          
          {query.trim().length >= 2 && results.length === 0 && !loading && <div className="p-6 text-center text-muted-foreground text-sm">
              <p className="font-heading mb-1">No se encontraron resultados</p>
              <p className="text-xs">Intenta con otras palabras clave</p>
            </div>}
          
          {query.trim().length < 2 && <div className="p-6 text-center text-muted-foreground text-s">
              Escribe al menos 2 caracteres para buscar
            </div>}
        </div>}
    </div>;
};