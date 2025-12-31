import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DesignToken {
  name: string;
  value: string;
  type: string;
  category: string;
}

// Map token names to CSS variable names
const TOKEN_TO_CSS_MAP: Record<string, string> = {
  // Colors - Light mode
  "color.background": "--background",
  "color.foreground": "--foreground",
  "color.primary": "--primary",
  "color.primary-foreground": "--primary-foreground",
  "color.primary-hover": "--primary-hover",
  "color.primary-light": "--primary-light",
  "color.primary-dark": "--primary-dark",
  "color.secondary": "--secondary",
  "color.secondary-foreground": "--secondary-foreground",
  "color.muted": "--muted",
  "color.muted-foreground": "--muted-foreground",
  "color.accent": "--accent",
  "color.accent-foreground": "--accent-foreground",
  "color.card": "--card",
  "color.card-foreground": "--card-foreground",
  "color.border": "--border",
  "color.ring": "--ring",
  // Radius
  "radius.default": "--radius",
  // Shadows
  "shadow.brutal": "--shadow-brutal",
  "shadow.brutal-sm": "--shadow-brutal-sm",
  "shadow.brutal-lg": "--shadow-brutal-lg",
  "shadow.brutal-red": "--shadow-brutal-red",
};

// Convert hex to HSL string (without hsl() wrapper, just "H S% L%")
const hexToHSL = (hex: string): string | null => {
  // Remove # if present
  hex = hex.replace(/^#/, "");
  
  if (hex.length !== 6) return null;
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// Apply a single token to the document
export const applyTokenToCSS = (token: DesignToken) => {
  const cssVar = TOKEN_TO_CSS_MAP[token.name];
  if (!cssVar) return;

  let value = token.value;

  // Convert hex colors to HSL for CSS variables
  if (token.type === "color" && token.value.startsWith("#")) {
    const hsl = hexToHSL(token.value);
    if (hsl) {
      value = hsl;
    }
  }

  // Apply to root element
  document.documentElement.style.setProperty(cssVar, value);
};

// Apply all tokens
export const applyAllTokensToCSS = (tokens: DesignToken[]) => {
  tokens.forEach(applyTokenToCSS);
};

// Hook to load and apply tokens on mount
export const useDesignTokensApply = () => {
  useEffect(() => {
    const loadAndApplyTokens = async () => {
      const { data: tokens } = await supabase
        .from("design_tokens")
        .select("name, value, type, category");

      if (tokens) {
        applyAllTokensToCSS(tokens);
      }
    };

    loadAndApplyTokens();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("design_tokens_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "design_tokens",
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object" && "name" in payload.new) {
            applyTokenToCSS(payload.new as DesignToken);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
