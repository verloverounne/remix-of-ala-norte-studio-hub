// Definición completa de todos los tokens del sistema de diseño
// Basado en los valores actuales del CSS

export interface TokenDefinition {
  name: string;
  type: string;
  value: string;
  description: string;
  category: string;
}

export const DEFAULT_DESIGN_TOKENS: TokenDefinition[] = [
  // ========== COLORS ==========
  // Core Colors
  { name: "color.background", type: "color", value: "0 0% 98%", description: "Fondo principal del sitio", category: "colors" },
  { name: "color.foreground", type: "color", value: "0 0% 8%", description: "Color de texto principal", category: "colors" },
  { name: "color.card", type: "color", value: "0 0% 100%", description: "Fondo de tarjetas", category: "colors" },
  { name: "color.card-foreground", type: "color", value: "0 0% 8%", description: "Texto en tarjetas", category: "colors" },
  { name: "color.popover", type: "color", value: "0 0% 89.8039%", description: "Fondo de popovers", category: "colors" },
  { name: "color.popover-foreground", type: "color", value: "30 6.25% 25.098%", description: "Texto en popovers", category: "colors" },
  
  // Primary Colors
  { name: "color.primary", type: "color", value: "348 83% 47%", description: "Color primario - Rojo Ala Norte", category: "colors" },
  { name: "color.primary-foreground", type: "color", value: "0 0% 98%", description: "Texto sobre color primario", category: "colors" },
  { name: "color.primary-hover", type: "color", value: "343 100% 33%", description: "Color primario en hover", category: "colors" },
  { name: "color.primary-light", type: "color", value: "355 82% 60%", description: "Variante clara del primario", category: "colors" },
  { name: "color.primary-dark", type: "color", value: "343 100% 22%", description: "Variante oscura del primario", category: "colors" },
  
  // Secondary Colors
  { name: "color.secondary", type: "color", value: "0 0% 20%", description: "Color secundario - Gris oscuro", category: "colors" },
  { name: "color.secondary-foreground", type: "color", value: "0 0% 98%", description: "Texto sobre color secundario", category: "colors" },
  { name: "color.secondary-hover", type: "color", value: "0 0% 15%", description: "Color secundario en hover", category: "colors" },
  
  // Neutral Colors
  { name: "color.muted", type: "color", value: "0 0% 90%", description: "Color muted - Gris claro", category: "colors" },
  { name: "color.muted-foreground", type: "color", value: "0 0% 30%", description: "Texto muted", category: "colors" },
  
  // Accent Colors
  { name: "color.accent", type: "color", value: "356 91% 59%", description: "Color de acento", category: "colors" },
  { name: "color.accent-foreground", type: "color", value: "0 0% 98%", description: "Texto sobre acento", category: "colors" },
  
  // Destructive Colors
  { name: "color.destructive", type: "color", value: "348 83% 47%", description: "Color destructivo/error", category: "colors" },
  { name: "color.destructive-foreground", type: "color", value: "0 0% 98%", description: "Texto sobre destructivo", category: "colors" },
  
  // Border & Input Colors
  { name: "color.border", type: "color", value: "24 5.4348% 63.9216%", description: "Color de bordes", category: "colors" },
  { name: "color.input", type: "color", value: "0 0% 8%", description: "Color de inputs", category: "colors" },
  { name: "color.ring", type: "color", value: "348 83% 47%", description: "Color de ring (focus)", category: "colors" },
  
  // Gray Scale
  { name: "color.gray-dark", type: "color", value: "0 0% 15%", description: "Gris oscuro", category: "colors" },
  { name: "color.gray-medium", type: "color", value: "0 0% 40%", description: "Gris medio", category: "colors" },
  { name: "color.gray-light", type: "color", value: "0 0% 70%", description: "Gris claro", category: "colors" },
  { name: "color.gray-lighter", type: "color", value: "0 0% 90%", description: "Gris muy claro", category: "colors" },
  
  // Tritone Filter Colors
  { name: "color.tritone.high", type: "color", value: "0 0% 98%", description: "Color para tonos altos del filtro tritone (áreas claras de la imagen)", category: "colors" },
  { name: "color.tritone.mid", type: "color", value: "0 0% 15%", description: "Color para tonos medios del filtro tritone (áreas medias de la imagen)", category: "colors" },
  { name: "color.tritone.low", type: "color", value: "0 0% 8%", description: "Color para tonos bajos del filtro tritone (áreas oscuras de la imagen)", category: "colors" },
  
  // ========== TYPOGRAPHY ==========
  { name: "font.family.sans", type: "font-family", value: "Poppins, ui-sans-serif, system-ui, sans-serif", description: "Familia tipográfica principal", category: "typography" },
  { name: "font.family.serif", type: "font-family", value: "Lora, ui-serif, Georgia, Cambria, Times New Roman, Times, serif", description: "Familia tipográfica serif", category: "typography" },
  { name: "font.family.mono", type: "font-family", value: "Roboto Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace", description: "Familia tipográfica monoespaciada", category: "typography" },
  { name: "font.family.heading", type: "font-family", value: "Poppins, ui-sans-serif, system-ui, sans-serif", description: "Familia tipográfica para títulos", category: "typography" },
  
  { name: "font.size.xs", type: "font-size", value: "0.75rem", description: "Tamaño de fuente extra pequeño (12px)", category: "typography" },
  { name: "font.size.sm", type: "font-size", value: "0.875rem", description: "Tamaño de fuente pequeño (14px)", category: "typography" },
  { name: "font.size.base", type: "font-size", value: "1rem", description: "Tamaño de fuente base (16px)", category: "typography" },
  { name: "font.size.lg", type: "font-size", value: "1.125rem", description: "Tamaño de fuente grande (18px)", category: "typography" },
  { name: "font.size.xl", type: "font-size", value: "1.25rem", description: "Tamaño de fuente extra grande (20px)", category: "typography" },
  { name: "font.size.2xl", type: "font-size", value: "1.5rem", description: "Tamaño de fuente 2xl (24px)", category: "typography" },
  { name: "font.size.3xl", type: "font-size", value: "1.875rem", description: "Tamaño de fuente 3xl (30px)", category: "typography" },
  { name: "font.size.4xl", type: "font-size", value: "2.25rem", description: "Tamaño de fuente 4xl (36px)", category: "typography" },
  { name: "font.size.5xl", type: "font-size", value: "3rem", description: "Tamaño de fuente 5xl (48px)", category: "typography" },
  { name: "font.size.6xl", type: "font-size", value: "3.75rem", description: "Tamaño de fuente 6xl (60px)", category: "typography" },
  { name: "font.size.7xl", type: "font-size", value: "4.5rem", description: "Tamaño de fuente 7xl (72px)", category: "typography" },
  { name: "font.size.8xl", type: "font-size", value: "6rem", description: "Tamaño de fuente 8xl (96px)", category: "typography" },
  
  { name: "font.weight.light", type: "font-weight", value: "300", description: "Peso de fuente ligero", category: "typography" },
  { name: "font.weight.normal", type: "font-weight", value: "400", description: "Peso de fuente normal", category: "typography" },
  { name: "font.weight.medium", type: "font-weight", value: "500", description: "Peso de fuente medio", category: "typography" },
  { name: "font.weight.semibold", type: "font-weight", value: "600", description: "Peso de fuente semi-bold", category: "typography" },
  { name: "font.weight.bold", type: "font-weight", value: "700", description: "Peso de fuente bold", category: "typography" },
  { name: "font.weight.extrabold", type: "font-weight", value: "800", description: "Peso de fuente extra-bold", category: "typography" },
  { name: "font.weight.black", type: "font-weight", value: "900", description: "Peso de fuente black", category: "typography" },
  
  { name: "line.height.tight", type: "line-height", value: "1.25", description: "Line height tight", category: "typography" },
  { name: "line.height.snug", type: "line-height", value: "1.375", description: "Line height snug", category: "typography" },
  { name: "line.height.normal", type: "line-height", value: "1.5", description: "Line height normal", category: "typography" },
  { name: "line.height.relaxed", type: "line-height", value: "1.625", description: "Line height relaxed", category: "typography" },
  { name: "line.height.loose", type: "line-height", value: "2", description: "Line height loose", category: "typography" },
  
  { name: "letter.spacing.tighter", type: "letter-spacing", value: "-0.05em", description: "Letter spacing más apretado", category: "typography" },
  { name: "letter.spacing.tight", type: "letter-spacing", value: "-0.025em", description: "Letter spacing apretado", category: "typography" },
  { name: "letter.spacing.normal", type: "letter-spacing", value: "0em", description: "Letter spacing normal", category: "typography" },
  { name: "letter.spacing.wide", type: "letter-spacing", value: "0.025em", description: "Letter spacing amplio", category: "typography" },
  { name: "letter.spacing.wider", type: "letter-spacing", value: "0.05em", description: "Letter spacing más amplio", category: "typography" },
  { name: "letter.spacing.widest", type: "letter-spacing", value: "0.1em", description: "Letter spacing muy amplio", category: "typography" },
  
  // ========== SPACING ==========
  { name: "spacing.0", type: "spacing", value: "0px", description: "Espaciado 0", category: "spacing" },
  { name: "spacing.1", type: "spacing", value: "0.25rem", description: "Espaciado 1 (4px)", category: "spacing" },
  { name: "spacing.2", type: "spacing", value: "0.5rem", description: "Espaciado 2 (8px)", category: "spacing" },
  { name: "spacing.3", type: "spacing", value: "0.75rem", description: "Espaciado 3 (12px)", category: "spacing" },
  { name: "spacing.4", type: "spacing", value: "1rem", description: "Espaciado 4 (16px)", category: "spacing" },
  { name: "spacing.5", type: "spacing", value: "1.25rem", description: "Espaciado 5 (20px)", category: "spacing" },
  { name: "spacing.6", type: "spacing", value: "1.5rem", description: "Espaciado 6 (24px)", category: "spacing" },
  { name: "spacing.8", type: "spacing", value: "2rem", description: "Espaciado 8 (32px)", category: "spacing" },
  { name: "spacing.10", type: "spacing", value: "2.5rem", description: "Espaciado 10 (40px)", category: "spacing" },
  { name: "spacing.12", type: "spacing", value: "3rem", description: "Espaciado 12 (48px)", category: "spacing" },
  { name: "spacing.16", type: "spacing", value: "4rem", description: "Espaciado 16 (64px)", category: "spacing" },
  { name: "spacing.20", type: "spacing", value: "5rem", description: "Espaciado 20 (80px)", category: "spacing" },
  { name: "spacing.24", type: "spacing", value: "6rem", description: "Espaciado 24 (96px)", category: "spacing" },
  
  // ========== RADIUS ==========
  { name: "radius.none", type: "radius", value: "0rem", description: "Sin border radius", category: "radius" },
  { name: "radius.sm", type: "radius", value: "0.125rem", description: "Border radius pequeño", category: "radius" },
  { name: "radius.default", type: "radius", value: "0.125rem", description: "Border radius por defecto", category: "radius" },
  { name: "radius.md", type: "radius", value: "0.375rem", description: "Border radius medio", category: "radius" },
  { name: "radius.lg", type: "radius", value: "0.5rem", description: "Border radius grande", category: "radius" },
  { name: "radius.xl", type: "radius", value: "0.75rem", description: "Border radius extra grande", category: "radius" },
  { name: "radius.2xl", type: "radius", value: "1rem", description: "Border radius 2xl", category: "radius" },
  { name: "radius.3xl", type: "radius", value: "1.5rem", description: "Border radius 3xl", category: "radius" },
  { name: "radius.full", type: "radius", value: "9999px", description: "Border radius completo (círculo)", category: "radius" },
  
  // ========== BORDERS ==========
  { name: "border.width.none", type: "border", value: "0px", description: "Sin borde", category: "radius" },
  { name: "border.width.default", type: "border", value: "1px", description: "Ancho de borde por defecto", category: "radius" },
  { name: "border.width.thin", type: "border", value: "1px", description: "Borde delgado", category: "radius" },
  { name: "border.width.thick", type: "border", value: "2px", description: "Borde grueso", category: "radius" },
  { name: "border.width.brutal", type: "border", value: "1px", description: "Borde brutal", category: "radius" },
  { name: "border.width.2", type: "border", value: "2px", description: "Borde 2px", category: "radius" },
  { name: "border.width.4", type: "border", value: "4px", description: "Borde 4px", category: "radius" },
  { name: "border.width.8", type: "border", value: "8px", description: "Borde 8px", category: "radius" },
  
  // ========== SHADOWS ==========
  { name: "shadow.brutal", type: "shadow", value: "4px 4px 0 hsl(0 0% 8%)", description: "Sombra brutal", category: "shadows" },
  { name: "shadow.brutal-sm", type: "shadow", value: "2px 2px 0 hsl(0 0% 8%)", description: "Sombra brutal pequeña", category: "shadows" },
  { name: "shadow.brutal-lg", type: "shadow", value: "6px 6px 0 hsl(0 0% 8%)", description: "Sombra brutal grande", category: "shadows" },
  { name: "shadow.brutal-red", type: "shadow", value: "4px 4px 0 hsl(348 83% 47%)", description: "Sombra brutal roja", category: "shadows" },
  { name: "shadow.sm", type: "shadow", value: "3px 5px 7.5px -1px hsl(240, 4%, 46%)", description: "Sombra pequeña", category: "shadows" },
  { name: "shadow.md", type: "shadow", value: "3px 5px 15px -1px hsl(240, 4%, 46%)", description: "Sombra media", category: "shadows" },
  { name: "shadow.lg", type: "shadow", value: "3px 5px 37.5px -1px hsl(240, 4%, 46%)", description: "Sombra grande", category: "shadows" },
  { name: "shadow.xl", type: "shadow", value: "0px 10px 50px -5px hsl(240, 4%, 46%)", description: "Sombra extra grande", category: "shadows" },
  { name: "shadow.2xl", type: "shadow", value: "0px 20px 100px -10px hsl(240, 4%, 46%)", description: "Sombra 2xl", category: "shadows" },
  
  // ========== TRANSITIONS ==========
  { name: "transition.brutal", type: "transition", value: "all 0.1s linear", description: "Transición brutal (instantánea)", category: "shadows" },
  { name: "transition.none", type: "transition", value: "none", description: "Sin transición", category: "shadows" },
  { name: "transition.fast", type: "transition", value: "all 0.15s ease-out", description: "Transición rápida", category: "shadows" },
  { name: "transition.normal", type: "transition", value: "all 0.3s ease-out", description: "Transición normal", category: "shadows" },
  { name: "transition.slow", type: "transition", value: "all 0.5s ease-out", description: "Transición lenta", category: "shadows" },
  
  // ========== GRADIENTS ==========
  { name: "gradient.primary", type: "color", value: "linear-gradient(135deg, hsl(348 83% 47%), hsl(343 100% 33%))", description: "Gradiente primario", category: "colors" },
  { name: "gradient.hero", type: "color", value: "linear-gradient(135deg, hsl(0 0% 8% / 0.95), hsl(348 83% 47% / 0.85))", description: "Gradiente hero", category: "colors" },
  { name: "gradient.border-silver", type: "color", value: "linear-gradient(135deg, #e5e7eb, #9ca3af)", description: "Gradiente borde plateado", category: "colors" },
  { name: "gradient.border-silver-vertical", type: "color", value: "linear-gradient(180deg, #e5e7eb, #9ca3af)", description: "Gradiente borde plateado vertical", category: "colors" },
  
  // ========== LAYOUT ==========
  { name: "breakpoint.sm", type: "breakpoint", value: "640px", description: "Breakpoint pequeño (mobile)", category: "layout" },
  { name: "breakpoint.md", type: "breakpoint", value: "768px", description: "Breakpoint medio (tablet)", category: "layout" },
  { name: "breakpoint.lg", type: "breakpoint", value: "1024px", description: "Breakpoint grande (desktop)", category: "layout" },
  { name: "breakpoint.xl", type: "breakpoint", value: "1280px", description: "Breakpoint extra grande", category: "layout" },
  { name: "breakpoint.2xl", type: "breakpoint", value: "1536px", description: "Breakpoint 2xl", category: "layout" },
  
  { name: "container.max-width", type: "container", value: "1280px", description: "Ancho máximo del contenedor", category: "layout" },
  { name: "container.padding", type: "container", value: "2rem", description: "Padding del contenedor", category: "layout" },
  
  { name: "z-index.base", type: "z-index", value: "1", description: "Z-index base", category: "layout" },
  { name: "z-index.content", type: "z-index", value: "10", description: "Z-index contenido", category: "layout" },
  { name: "z-index.sticky", type: "z-index", value: "20", description: "Z-index sticky", category: "layout" },
  { name: "z-index.dropdown", type: "z-index", value: "50", description: "Z-index dropdown", category: "layout" },
  { name: "z-index.modal", type: "z-index", value: "100", description: "Z-index modal", category: "layout" },
  { name: "z-index.toast", type: "z-index", value: "200", description: "Z-index toast", category: "layout" },
  
  // ========== COMPONENTS ==========
  { name: "button.height.sm", type: "size", value: "2rem", description: "Altura botón pequeño", category: "spacing" },
  { name: "button.height.default", type: "size", value: "2.5rem", description: "Altura botón por defecto", category: "spacing" },
  { name: "button.height.lg", type: "size", value: "3rem", description: "Altura botón grande", category: "spacing" },
  { name: "button.padding-x.sm", type: "spacing", value: "0.75rem", description: "Padding horizontal botón pequeño", category: "spacing" },
  { name: "button.padding-x.default", type: "spacing", value: "1rem", description: "Padding horizontal botón por defecto", category: "spacing" },
  { name: "button.padding-x.lg", type: "spacing", value: "1.5rem", description: "Padding horizontal botón grande", category: "spacing" },
  { name: "button.radius", type: "radius", value: "0.125rem", description: "Border radius de botones", category: "radius" },
  
  { name: "input.height.sm", type: "size", value: "2rem", description: "Altura input pequeño", category: "spacing" },
  { name: "input.height.default", type: "size", value: "2.5rem", description: "Altura input por defecto", category: "spacing" },
  { name: "input.height.lg", type: "size", value: "3rem", description: "Altura input grande", category: "spacing" },
  { name: "input.padding-x", type: "spacing", value: "0.75rem", description: "Padding horizontal de inputs", category: "spacing" },
  { name: "input.radius", type: "radius", value: "0.125rem", description: "Border radius de inputs", category: "radius" },
  
  { name: "card.padding", type: "spacing", value: "1.5rem", description: "Padding de tarjetas", category: "spacing" },
  { name: "card.radius", type: "radius", value: "0.125rem", description: "Border radius de tarjetas", category: "radius" },
  { name: "card.gap", type: "spacing", value: "1rem", description: "Espaciado interno de tarjetas", category: "spacing" },
];
