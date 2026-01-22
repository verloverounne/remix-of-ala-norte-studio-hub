import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Siglas técnicas que deben mantenerse en MAYÚSCULAS
const TECHNICAL_ACRONYMS = [
  "HD", "SDI", "HDMI", "USB", "LED", "HMI", "AC", "DC", "RGB", "DMX",
  "XLR", "BNC", "NP", "BP", "AB", "V", "PL", "EF", "RF", "MFT",
  "E", "S35", "FF", "4K", "8K", "2K", "UHD", "RAW", "SSD", "CFast",
  "SD", "CF", "LUT", "ND", "IR", "UV", "VR", "AR", "XR", "AI",
  "DI", "LF", "S16", "S8", "FX", "C70", "C300", "C500", "R5", "R6",
  "A7", "FX3", "FX6", "FX9", "FS5", "FS7", "EOS", "XC", "XF", "Z",
  "S1H", "GH", "BMPCC", "URSA", "LT", "XT", "SXT", "LPL", "SP", "CP",
  "UP", "MP", "DP", "MK", "CN", "T", "F", "MM", "CM", "M", "KG", "LB",
  "W", "WH", "AH", "MAH", "V-MOUNT", "RS", "RSC", "SC", "WCU", "15MM",
  "19MM", "LWS", "SWS", "TVL", "II", "III", "IV", "VI", "X", "XL",
  "XXL", "S", "L", "XS", "XXS", "S60", "S30", "S120", "MAX", "PRO",
  "PLUS", "LITE", "AIR"
];

// Nombres de marcas que van en Title Case (primera letra mayúscula)
const BRAND_NAMES = [
  "ARRI", "RED", "SONY", "CANON", "ZEISS", "COOKE", "ANGENIEUX", "FUJINON",
  "LEITZ", "SIGMA", "TILTA", "DJI", "APUTURE", "GODOX", "NANLITE", "LITEPANELS",
  "KINO", "DEDOLIGHT", "ASTERA", "QUASAR", "ROSCO", "CHIMERA", "ALEXA", "VENICE",
  "KOMODO", "RAPTOR", "MONSTRO", "GEMINI", "HELIUM", "DRAGON", "MINI", "HAWK",
  "VANTAGE", "PANAVISION", "MOVIECAM", "KINEFINITY", "BLACKMAGIC", "ATOMOS",
  "SMALLHD", "SHOGUN", "NINJA", "SUMO", "TERADEK", "BOLT", "CUBE", "COLR",
  "SACHTLER", "OCONNOR", "CARTONI", "RONFORD", "BAKER", "MILLER", "LIBEC",
  "MANFROTTO", "GITZO", "EASYRIG", "READYRIG", "STEADICAM", "MOVI", "RONIN",
  "GIMBAL", "CRANE", "NUCLEUS", "CFORCE", "CMOTION", "PRESTON", "BARTECH",
  "HEDEN", "PDMOVIE", "TECHNOCRANE", "SCORPIO", "LAMBDA", "SUPERTECHNO",
  "MOVIEBIRD", "GFCRANE", "AVENGER", "KUPO", "RICHARDSON", "SKYPANEL", "ORBITER",
  "FRESNEL", "SNAPBAG", "SOFTBOX", "ANTON", "BAUER", "IDX", "PAG", "CORE", "SWX",
  "BEBOB", "BLUESHAPE", "FXLION", "DYNACORE", "GOLD", "MOLE", "CHROSZIEL"
];

/**
 * Formatea nombres de equipos: convierte a lowercase primero,
 * luego capitaliza primera palabra, mantiene siglas técnicas en mayúsculas
 * y nombres de marcas en Title Case.
 */
export const formatEquipmentName = (name: string): string => {
  return name
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      const upperWord = word.toUpperCase();
      // Si es una sigla técnica, mantenerla en MAYÚSCULAS
      if (TECHNICAL_ACRONYMS.includes(upperWord)) return upperWord;
      // Si es un nombre de marca, Title Case
      if (BRAND_NAMES.includes(upperWord)) {
        return upperWord.charAt(0).toUpperCase() + upperWord.slice(1).toLowerCase();
      }
      // Si contiene números mezclados con letras (ej: "4x4", "16mm"), mantener
      if (/\d/.test(word) && /[a-zA-Z]/.test(word)) return word;
      // Si es todo números, mantener
      if (/^\d+$/.test(word)) return word;
      // Primera palabra: primera letra mayúscula
      if (index === 0) return word.charAt(0).toUpperCase() + word.slice(1);
      // Resto: minúsculas
      return word;
    })
    .join(" ");
};
