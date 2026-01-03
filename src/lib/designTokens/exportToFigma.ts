/**
 * Export Design System + Atomic Components to Figma Format
 * Compatible with Tokens Studio for Figma
 */

interface DesignToken {
  id: string;
  name: string;
  value: string;
  type: string;
  category: string;
  description?: string;
}

interface FigmaToken {
  $type: string;
  $value: string;
  $description?: string;
}

interface FigmaDesignSystem {
  colors: Record<string, FigmaToken>;
  typography: Record<string, FigmaToken>;
  spacing: Record<string, FigmaToken>;
  radius: Record<string, FigmaToken>;
  shadow: Record<string, FigmaToken>;
  border: Record<string, FigmaToken>;
  components: {
    atoms: {
      button: {
        sizes: Record<string, Record<string, FigmaToken>>;
        variants: Record<string, Record<string, FigmaToken>>;
      };
      input: Record<string, FigmaToken>;
      badge: Record<string, FigmaToken>;
    };
    molecules: {
      card: Record<string, FigmaToken>;
      navbar: Record<string, FigmaToken>;
    };
  };
}

// Normalize color values - ensure # prefix for hex
function normalizeColor(value: string): string {
  if (/^[0-9A-Fa-f]{6}$/.test(value)) {
    return `#${value}`;
  }
  if (/^[0-9A-Fa-f]{3}$/.test(value)) {
    return `#${value}`;
  }
  return value;
}

// Map internal types to Figma $type
function mapToFigmaType(category: string, type: string): string {
  if (category === 'color' || type === 'color') return 'color';
  if (category === 'spacing' || type === 'spacing') return 'dimension';
  if (category === 'radius' || type === 'radius') return 'dimension';
  if (category === 'shadow' || type === 'shadow') return 'shadow';
  if (category === 'border' || type === 'border') return 'dimension';
  if (category.startsWith('font') || type.startsWith('font')) return 'typography';
  return 'string';
}

// Atomic Design Component Specs
const COMPONENT_SPECS = {
  atoms: {
    button: {
      sizes: {
        sm: {
          height: { $type: 'dimension', $value: '32px' },
          paddingX: { $type: 'dimension', $value: '16px' },
          paddingY: { $type: 'dimension', $value: '12px' },
          fontSize: { $type: 'dimension', $value: '12px' },
          gap: { $type: 'dimension', $value: '6px' },
        },
        md: {
          height: { $type: 'dimension', $value: '40px' },
          paddingX: { $type: 'dimension', $value: '24px' },
          paddingY: { $type: 'dimension', $value: '16px' },
          fontSize: { $type: 'dimension', $value: '14px' },
          gap: { $type: 'dimension', $value: '8px' },
        },
        lg: {
          height: { $type: 'dimension', $value: '48px' },
          paddingX: { $type: 'dimension', $value: '32px' },
          paddingY: { $type: 'dimension', $value: '20px' },
          fontSize: { $type: 'dimension', $value: '16px' },
          gap: { $type: 'dimension', $value: '10px' },
        },
        icon: {
          height: { $type: 'dimension', $value: '40px' },
          width: { $type: 'dimension', $value: '40px' },
          padding: { $type: 'dimension', $value: '0px' },
        },
      },
      variants: {
        default: {
          background: { $type: 'color', $value: '#1A1A1A' },
          text: { $type: 'color', $value: '#FFFFFF' },
          hoverBackground: { $type: 'color', $value: '#333333' },
        },
        destructive: {
          background: { $type: 'color', $value: '#DC143C' },
          text: { $type: 'color', $value: '#FFFFFF' },
          hoverBackground: { $type: 'color', $value: '#A7002F' },
        },
        outline: {
          background: { $type: 'color', $value: 'transparent' },
          border: { $type: 'color', $value: '#E5E5E5' },
          text: { $type: 'color', $value: '#1A1A1A' },
          hoverBackground: { $type: 'color', $value: '#F5F5F5' },
        },
        secondary: {
          background: { $type: 'color', $value: '#F5F5F5' },
          text: { $type: 'color', $value: '#1A1A1A' },
          hoverBackground: { $type: 'color', $value: '#E5E5E5' },
        },
        ghost: {
          background: { $type: 'color', $value: 'transparent' },
          text: { $type: 'color', $value: '#1A1A1A' },
          hoverBackground: { $type: 'color', $value: '#F5F5F5' },
        },
        link: {
          background: { $type: 'color', $value: 'transparent' },
          text: { $type: 'color', $value: '#DC143C' },
          hoverText: { $type: 'color', $value: '#A7002F' },
          textDecoration: { $type: 'string', $value: 'underline-offset-4' },
        },
      },
      states: {
        disabled: {
          opacity: { $type: 'number', $value: '0.5' },
          pointerEvents: { $type: 'string', $value: 'none' },
        },
        focus: {
          ringWidth: { $type: 'dimension', $value: '2px' },
          ringOffset: { $type: 'dimension', $value: '2px' },
          ringColor: { $type: 'color', $value: '#1A1A1A' },
        },
      },
    },
    input: {
      base: {
        height: { $type: 'dimension', $value: '40px' },
        paddingX: { $type: 'dimension', $value: '12px' },
        paddingY: { $type: 'dimension', $value: '8px' },
        fontSize: { $type: 'dimension', $value: '14px' },
        lineHeight: { $type: 'dimension', $value: '20px' },
        borderWidth: { $type: 'dimension', $value: '1px' },
        borderRadius: { $type: 'dimension', $value: '6px' },
      },
      colors: {
        background: { $type: 'color', $value: 'transparent' },
        border: { $type: 'color', $value: '#E5E5E5' },
        text: { $type: 'color', $value: '#1A1A1A' },
        placeholder: { $type: 'color', $value: '#A3A3A3' },
      },
      states: {
        focus: {
          ringWidth: { $type: 'dimension', $value: '2px' },
          ringOffset: { $type: 'dimension', $value: '0px' },
          ringColor: { $type: 'color', $value: '#1A1A1A' },
        },
        disabled: {
          opacity: { $type: 'number', $value: '0.5' },
          cursor: { $type: 'string', $value: 'not-allowed' },
        },
        error: {
          borderColor: { $type: 'color', $value: '#DC143C' },
          ringColor: { $type: 'color', $value: '#DC143C' },
        },
      },
    },
    badge: {
      base: {
        fontSize: { $type: 'dimension', $value: '12px' },
        fontWeight: { $type: 'string', $value: '600' },
        lineHeight: { $type: 'dimension', $value: '16px' },
        paddingX: { $type: 'dimension', $value: '10px' },
        paddingY: { $type: 'dimension', $value: '2px' },
        borderRadius: { $type: 'dimension', $value: '999px' },
        borderWidth: { $type: 'dimension', $value: '1px' },
      },
      variants: {
        default: {
          background: { $type: 'color', $value: '#1A1A1A' },
          text: { $type: 'color', $value: '#FFFFFF' },
        },
        secondary: {
          background: { $type: 'color', $value: '#F5F5F5' },
          text: { $type: 'color', $value: '#1A1A1A' },
        },
        destructive: {
          background: { $type: 'color', $value: '#DC143C' },
          text: { $type: 'color', $value: '#FFFFFF' },
        },
        outline: {
          background: { $type: 'color', $value: 'transparent' },
          border: { $type: 'color', $value: '#E5E5E5' },
          text: { $type: 'color', $value: '#1A1A1A' },
        },
      },
    },
    checkbox: {
      base: {
        size: { $type: 'dimension', $value: '16px' },
        borderRadius: { $type: 'dimension', $value: '4px' },
        borderWidth: { $type: 'dimension', $value: '1px' },
      },
      colors: {
        border: { $type: 'color', $value: '#1A1A1A' },
        background: { $type: 'color', $value: 'transparent' },
        checkedBackground: { $type: 'color', $value: '#1A1A1A' },
        checkmark: { $type: 'color', $value: '#FFFFFF' },
      },
    },
    switch: {
      base: {
        width: { $type: 'dimension', $value: '44px' },
        height: { $type: 'dimension', $value: '24px' },
        thumbSize: { $type: 'dimension', $value: '20px' },
        borderRadius: { $type: 'dimension', $value: '999px' },
      },
      colors: {
        uncheckedBackground: { $type: 'color', $value: '#E5E5E5' },
        checkedBackground: { $type: 'color', $value: '#1A1A1A' },
        thumb: { $type: 'color', $value: '#FFFFFF' },
      },
    },
  },
  molecules: {
    card: {
      base: {
        padding: { $type: 'dimension', $value: '24px' },
        borderRadius: { $type: 'dimension', $value: '8px' },
        borderWidth: { $type: 'dimension', $value: '1px' },
      },
      colors: {
        background: { $type: 'color', $value: '#FFFFFF' },
        border: { $type: 'color', $value: '#E5E5E5' },
        text: { $type: 'color', $value: '#1A1A1A' },
        mutedText: { $type: 'color', $value: '#737373' },
      },
      shadow: {
        default: { $type: 'shadow', $value: '0 1px 3px rgba(0,0,0,0.1)' },
        hover: { $type: 'shadow', $value: '0 10px 30px rgba(0,0,0,0.15)' },
      },
      header: {
        gap: { $type: 'dimension', $value: '6px' },
      },
      content: {
        paddingTop: { $type: 'dimension', $value: '0px' },
      },
      footer: {
        paddingTop: { $type: 'dimension', $value: '24px' },
      },
    },
    navbar: {
      desktop: {
        height: { $type: 'dimension', $value: '80px' },
        paddingX: { $type: 'dimension', $value: '32px' },
      },
      mobile: {
        height: { $type: 'dimension', $value: '64px' },
        paddingX: { $type: 'dimension', $value: '16px' },
      },
      colors: {
        background: { $type: 'color', $value: '#FFFFFF' },
        text: { $type: 'color', $value: '#1A1A1A' },
        border: { $type: 'color', $value: '#E5E5E5' },
      },
      shadow: {
        default: { $type: 'shadow', $value: '0 1px 3px rgba(0,0,0,0.1)' },
      },
      logo: {
        height: { $type: 'dimension', $value: '40px' },
      },
      navItem: {
        fontSize: { $type: 'dimension', $value: '14px' },
        fontWeight: { $type: 'string', $value: '500' },
        gap: { $type: 'dimension', $value: '32px' },
      },
    },
    searchBar: {
      base: {
        height: { $type: 'dimension', $value: '48px' },
        paddingX: { $type: 'dimension', $value: '16px' },
        borderRadius: { $type: 'dimension', $value: '8px' },
        gap: { $type: 'dimension', $value: '12px' },
      },
      colors: {
        background: { $type: 'color', $value: '#F5F5F5' },
        border: { $type: 'color', $value: '#E5E5E5' },
        text: { $type: 'color', $value: '#1A1A1A' },
        placeholder: { $type: 'color', $value: '#A3A3A3' },
        icon: { $type: 'color', $value: '#737373' },
      },
    },
    dialog: {
      overlay: {
        background: { $type: 'color', $value: 'rgba(0,0,0,0.8)' },
      },
      content: {
        maxWidth: { $type: 'dimension', $value: '512px' },
        padding: { $type: 'dimension', $value: '24px' },
        borderRadius: { $type: 'dimension', $value: '12px' },
        gap: { $type: 'dimension', $value: '16px' },
      },
      colors: {
        background: { $type: 'color', $value: '#FFFFFF' },
        border: { $type: 'color', $value: '#E5E5E5' },
      },
      shadow: {
        default: { $type: 'shadow', $value: '0 25px 50px -12px rgba(0,0,0,0.25)' },
      },
    },
  },
  organisms: {
    heroCarousel: {
      base: {
        height: { $type: 'dimension', $value: '600px' },
        mobileHeight: { $type: 'dimension', $value: '400px' },
      },
      overlay: {
        gradient: { $type: 'string', $value: 'linear-gradient(to right, rgba(0,0,0,0.7), transparent)' },
      },
      content: {
        maxWidth: { $type: 'dimension', $value: '600px' },
        gap: { $type: 'dimension', $value: '24px' },
      },
      title: {
        fontSize: { $type: 'dimension', $value: '48px' },
        mobileFontSize: { $type: 'dimension', $value: '32px' },
        fontWeight: { $type: 'string', $value: '700' },
        lineHeight: { $type: 'number', $value: '1.1' },
      },
      navigation: {
        buttonSize: { $type: 'dimension', $value: '48px' },
        dotSize: { $type: 'dimension', $value: '8px' },
        dotActiveSize: { $type: 'dimension', $value: '24px' },
      },
    },
    categorySection: {
      base: {
        gap: { $type: 'dimension', $value: '32px' },
        paddingY: { $type: 'dimension', $value: '64px' },
      },
      header: {
        gap: { $type: 'dimension', $value: '16px' },
      },
      title: {
        fontSize: { $type: 'dimension', $value: '32px' },
        fontWeight: { $type: 'string', $value: '700' },
      },
      grid: {
        columns: { $type: 'number', $value: '4' },
        gap: { $type: 'dimension', $value: '24px' },
      },
    },
    footer: {
      base: {
        paddingY: { $type: 'dimension', $value: '64px' },
        paddingX: { $type: 'dimension', $value: '32px' },
      },
      colors: {
        background: { $type: 'color', $value: '#1A1A1A' },
        text: { $type: 'color', $value: '#FFFFFF' },
        mutedText: { $type: 'color', $value: '#A3A3A3' },
        link: { $type: 'color', $value: '#FFFFFF' },
        linkHover: { $type: 'color', $value: '#DC143C' },
      },
      grid: {
        columns: { $type: 'number', $value: '4' },
        gap: { $type: 'dimension', $value: '48px' },
      },
      section: {
        gap: { $type: 'dimension', $value: '16px' },
      },
      logo: {
        height: { $type: 'dimension', $value: '48px' },
      },
    },
  },
};

export function exportToFigma(tokens: DesignToken[]): FigmaDesignSystem {
  const figma: FigmaDesignSystem = {
    colors: {},
    typography: {},
    spacing: {},
    radius: {},
    shadow: {},
    border: {},
    components: COMPONENT_SPECS as any,
  };

  // Process tokens from database
  tokens.forEach((token) => {
    const figmaType = mapToFigmaType(token.category, token.type);
    const value = figmaType === 'color' ? normalizeColor(token.value) : token.value;
    
    const figmaToken: FigmaToken = {
      $type: figmaType,
      $value: value,
    };

    if (token.description) {
      figmaToken.$description = token.description;
    }

    // Route to correct category
    switch (token.category) {
      case 'color':
        figma.colors[token.name] = figmaToken;
        break;
      case 'fontFamily':
      case 'fontSize':
      case 'fontWeight':
      case 'lineHeight':
      case 'letterSpacing':
        if (!figma.typography[token.category]) {
          figma.typography[token.category] = {} as any;
        }
        (figma.typography as any)[token.category][token.name] = figmaToken;
        break;
      case 'spacing':
        figma.spacing[token.name] = figmaToken;
        break;
      case 'radius':
        figma.radius[token.name] = figmaToken;
        break;
      case 'shadow':
        figma.shadow[token.name] = figmaToken;
        break;
      case 'border':
        figma.border[token.name] = figmaToken;
        break;
      default:
        // For other categories, create nested structure
        if (!(figma as any)[token.category]) {
          (figma as any)[token.category] = {};
        }
        (figma as any)[token.category][token.name] = figmaToken;
    }
  });

  return figma;
}

export function downloadFigmaTokens(tokens: DesignToken[]): void {
  const figmaData = exportToFigma(tokens);
  const blob = new Blob([JSON.stringify(figmaData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ala-norte-design-system-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
