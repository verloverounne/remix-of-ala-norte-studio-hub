import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DesignToken {
  name: string;
  value: string;
  type: string;
  category: string;
}

// Static map for core CSS variables that have specific names
const STATIC_TOKEN_TO_CSS_MAP: Record<string, string> = {
  // Core Colors
  "color.background": "--background",
  "color.foreground": "--foreground",
  "color.primary": "--primary",
  "color.primary-foreground": "--primary-foreground",
  "color.primary-hover": "--primary-hover",
  "color.primary-light": "--primary-light",
  "color.primary-dark": "--primary-dark",
  "color.secondary": "--secondary",
  "color.secondary-foreground": "--secondary-foreground",
  "color.secondary-hover": "--secondary-hover",
  "color.muted": "--muted",
  "color.muted-foreground": "--muted-foreground",
  "color.accent": "--accent",
  "color.accent-foreground": "--accent-foreground",
  "color.card": "--card",
  "color.card-foreground": "--card-foreground",
  "color.popover": "--popover",
  "color.popover-foreground": "--popover-foreground",
  "color.border": "--border",
  "color.input": "--input",
  "color.ring": "--ring",
  "color.destructive": "--destructive",
  "color.destructive-foreground": "--destructive-foreground",
  // Gray colors
  "color.gray-dark": "--gray-dark",
  "color.gray-medium": "--gray-medium",
  "color.gray-light": "--gray-light",
  "color.gray-lighter": "--gray-lighter",
  // Tritone filter colors
  "color.tritone.high": "--tritone-high",
  "color.tritone.mid": "--tritone-mid",
  "color.tritone.low": "--tritone-low",
  // Typography
  "font.family.sans": "--font-sans",
  "font.family.serif": "--font-serif",
  "font.family.mono": "--font-mono",
  "font.family.heading": "--font-heading",
  // Radius
  "radius.default": "--radius",
  "radius.none": "--radius-none",
  "radius.sm": "--radius-sm",
  "radius.md": "--radius-md",
  "radius.lg": "--radius-lg",
  "radius.xl": "--radius-xl",
  "radius.2xl": "--radius-2xl",
  "radius.3xl": "--radius-3xl",
  "radius.full": "--radius-full",
  // Border widths
  "border.width.none": "--border-width-none",
  "border.width.default": "--border-width-default",
  "border.width.thin": "--border-width-thin",
  "border.width.thick": "--border-width-thick",
  "border.width.brutal": "--border-width-brutal",
  "border.width.2": "--border-width-2",
  "border.width.4": "--border-width-4",
  "border.width.8": "--border-width-8",
  // Shadows
  "shadow.brutal": "--shadow-brutal",
  "shadow.brutal-sm": "--shadow-brutal-sm",
  "shadow.brutal-lg": "--shadow-brutal-lg",
  "shadow.brutal-red": "--shadow-brutal-red",
  "shadow.sm": "--shadow-sm",
  "shadow.md": "--shadow-md",
  "shadow.lg": "--shadow-lg",
  "shadow.xl": "--shadow-xl",
  "shadow.2xl": "--shadow-2xl",
  // Transitions
  "transition.brutal": "--transition-brutal",
  "transition.none": "--transition-none",
  "transition.fast": "--transition-fast",
  "transition.normal": "--transition-normal",
  "transition.slow": "--transition-slow",
  // Gradients
  "gradient.primary": "--gradient-primary",
  "gradient.hero": "--gradient-hero",
  "gradient.border-silver": "--border-gradient-silver",
  "gradient.border-silver-vertical": "--border-gradient-silver-vertical",
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

// Generate CSS variable name from token name dynamically
const generateCSSVarName = (tokenName: string): string => {
  // Check static map first
  if (STATIC_TOKEN_TO_CSS_MAP[tokenName]) {
    return STATIC_TOKEN_TO_CSS_MAP[tokenName];
  }
  
  // Special handling for font tokens
  if (tokenName.startsWith("font.")) {
    if (tokenName.includes("family")) {
      const familyType = tokenName.includes("heading") ? "heading" : 
                        tokenName.includes("serif") ? "serif" :
                        tokenName.includes("mono") ? "mono" : "sans";
      return `--font-${familyType}`;
    }
    // For font sizes, weights, etc., we'll use CSS custom properties
    // These might need to be applied differently
    return `--${tokenName.replace(/\./g, "-")}`;
  }
  
  // Dynamic generation: convert token.name.format to --token-name-format
  return `--${tokenName.replace(/\./g, "-")}`;
};

// Apply a single token to the document
export const applyTokenToCSS = (token: DesignToken) => {
  const cssVar = generateCSSVarName(token.name);
  let value = token.value;

  // Convert hex colors to HSL for CSS variables (only for color tokens)
  if (token.type === "color" && token.value.startsWith("#")) {
    const hsl = hexToHSL(token.value);
    if (hsl) {
      value = hsl;
    }
  }

  // Special handling for font-family tokens - apply to CSS variable
  if (token.type === "font-family") {
    // Font families are stored as strings, apply directly
    value = token.value;
  }

  // Special handling for gradients - they're already complete CSS values
  if (token.name.startsWith("gradient.")) {
    value = token.value;
  }

  // Apply to root element
  document.documentElement.style.setProperty(cssVar, value);
  
  // Also update Tailwind config if needed (for font families)
  if (token.type === "font-family" && token.name.includes("family")) {
    // Font families are handled via CSS variables, which Tailwind can use
    // This is already covered by the CSS variable above
  }
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