import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Lista de siglas comunes de la industria cinematográfica que deben mantenerse en mayúsculas
const EQUIPMENT_ACRONYMS = [
  "HD", "SDI", "HDMI", "USB", "LED", "HMI", "AC", "DC", "RGB", "DMX",
  "XLR", "BNC", "NP", "BP", "AB", "V", "PL", "EF", "RF", "MFT",
  "E", "S35", "FF", "4K", "8K", "2K", "UHD", "RAW", "SSD", "CFast",
  "SD", "CF", "LUT", "ND", "IR", "UV", "VR", "AR", "XR", "AI",
  "DI", "LF", "S16", "S8", "ARRI", "RED", "SONY", "CANON", "ZEISS",
  "COOKE", "ANGENIEUX", "FUJINON", "LEITZ", "SIGMA", "TILTA", "DJI",
  "APUTURE", "GODOX", "NANLITE", "LITEPANELS", "KINO", "DEDOLIGHT",
  "ASTERA", "QUASAR", "ROSCO", "CHIMERA", "SNAPBAG", "SOFTBOX",
  "FRESNEL", "PAR", "MR", "ALEXA", "VENICE", "FX", "C70", "C300",
  "C500", "R5", "R6", "A7", "FX3", "FX6", "FX9", "FS5", "FS7",
  "EOS", "XC", "XF", "Z", "S1H", "GH", "BMPCC", "URSA", "KOMODO",
  "RAPTOR", "MONSTRO", "GEMINI", "HELIUM", "DRAGON", "MINI", "LT",
  "XT", "SXT", "LPL", "SP", "CP", "UP", "MP", "DP", "MK", "CN",
  "T", "F", "MM", "CM", "M", "KG", "LB", "W", "WH", "AH", "MAH",
  "V-MOUNT", "GOLD", "ANTON", "BAUER", "IDX", "PAG", "CORE", "SWX",
  "BEBOB", "BLUESHAPE", "FXLION", "DYNACORE", "HAWK", "VANTAGE",
  "PANAVISION", "MOVIECAM", "KINEFINITY", "BLACKMAGIC", "ATOMOS",
  "SMALLHD", "TVL", "SHOGUN", "NINJA", "SUMO", "TERADEK", "BOLT",
  "CUBE", "COLR", "SACHTLER", "OCONNOR", "CARTONI", "RONFORD",
  "BAKER", "MILLER", "LIBEC", "MANFROTTO", "GITZO", "EASYRIG",
  "READYRIG", "STEADICAM", "MOVI", "RONIN", "GIMBAL", "CRANE",
  "RS", "RSC", "SC", "NUCLEUS", "WCU", "CFORCE", "CMOTION",
  "PRESTON", "BARTECH", "HEDEN", "PDMOVIE", "FOLLOWFOCUS", "MATTEBOX",
  "CLAMP", "ROD", "15MM", "19MM", "LWS", "SWS", "BRIDGE", "PLATE",
  "CAGE", "RIG", "SHOULDER", "HANDHELD", "TRIPOD", "DOLLY", "SLIDER",
  "JIB", "TECHNOCRANE", "SCORPIO", "LAMBDA", "SUPERTECHNO", "MOVIEBIRD",
  "GFCRANE", "HEAD", "FLUID", "GEARED", "DUTCH", "TILT", "PAN",
  "NODAL", "LEVELING", "SPEEDRAIL", "PIPE", "JUNIOR", "BABY", "COMBO",
  "CSTAND", "AVENGER", "KUPO", "GRIP", "GOBO", "FLAG", "FLOPPY",
  "SOLID", "NET", "SILK", "DIFF", "FRAME", "BUTTERFLY", "OVERHEAD",
  "REFLECTOR", "BOUNCE", "NEGATIVE", "POLY", "BEAD", "GRIFF", "ULTRA",
  "DINO", "MAXI", "BRUTE", "WENDY", "BLONDE", "REDHEAD", "MOLE",
  "RICHARDSON", "SKYPANEL", "ORBITER", "S60", "S30", "S120", "MAX",
  "PRO", "PLUS", "LITE", "AIR", "II", "III", "IV", "VI", "X",
  "XL", "XXL", "S", "L", "XS", "XXS"
];

/**
 * Formatea nombres de equipos: convierte a lowercase primero,
 * luego capitaliza primera palabra y mantiene siglas de industria en mayúsculas.
 */
export const formatEquipmentName = (name: string): string => {
  return name
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      const upperWord = word.toUpperCase();
      // Si es una sigla conocida, mantenerla en mayúsculas
      if (EQUIPMENT_ACRONYMS.includes(upperWord)) return upperWord;
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
