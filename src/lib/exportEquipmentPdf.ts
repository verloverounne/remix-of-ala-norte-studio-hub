import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { EquipmentWithCategory } from "@/types/supabase";
import { filterPubliclyVisible } from "@/lib/equipmentVisibility";
import { sortSubcategoriesByPrice } from "@/lib/subcategoryOrder";

interface Category {
  id: string;
  name: string;
  order_index?: number;
}
interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  order_index?: number;
}

const LOGO_URL = "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/assets//logoHblanco@2x.png";

async function fetchLogoAsDataUrl(): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = LOGO_URL;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("logo load failed"));
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    return { data: dataUrl, w: canvas.width, h: canvas.height };
  } catch {
    return null;
  }
}

function formatPrice(value: number | null | undefined): string {
  if (!value || value <= 0 || value === 1000) return "";
  return `$ ${value.toLocaleString("es-AR")}`;
}

export async function exportEquipmentPdf(
  equipment: EquipmentWithCategory[],
  categories: Category[],
  subcategories: Subcategory[],
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 64;

  // --- Header ---
  const logo = await fetchLogoAsDataUrl();
  const headerHeight = 80;
  // Dark bg behind logo
  doc.setFillColor(15, 17, 19);
  doc.rect(0, 0, pageWidth, headerHeight, "F");

  if (logo) {
    const targetH = 48;
    const ratio = logo.w / logo.h;
    const targetW = targetH * ratio;
    doc.addImage(logo.data, "PNG", marginX, 16, targetW, targetH);
  }

  // Title + date on right
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Lista de equipos", pageWidth - marginX, 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const today = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  doc.text(today, pageWidth - marginX, 32, { align: "right" });

  // Reset text color
  doc.setTextColor(20, 20, 20);

  // --- Group equipment ---
  const sortedCats = [...categories].sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));

  type Row = { name: string; price: string };
  type SubGroup = { sub: Subcategory | null; rows: Row[] };
  type CatGroup = { cat: Category; subs: SubGroup[] };

  // Only available equipment, same visibility rules as public subcategory filter
  // Same visibility rules as public subcategory filter
  const availableEquipment = filterPubliclyVisible(equipment);

  const groups: CatGroup[] = [];

  for (const cat of sortedCats) {
    const catItems = availableEquipment.filter((e) => e.category_id === cat.id);
    if (catItems.length === 0) continue;

    const catSubs = sortSubcategoriesByPrice(
      subcategories.filter((s) => s.category_id === cat.id),
      (id) => catItems.filter((e) => e.subcategory_id === id),
      cat,
    );

    const subGroups: SubGroup[] = [];

    const sortRows = (items: EquipmentWithCategory[]): Row[] =>
      [...items]
        .sort((a, b) => {
          const an = (a.name || "").trim();
          const bn = (b.name || "").trim();
          if (!an && !bn) return 0;
          if (!an) return 1;
          if (!bn) return -1;
          return an.localeCompare(bn, "es", { sensitivity: "base" });
        })
        .map((e) => ({
          name: e.name || "",
          price: formatPrice(e.price_per_day),
        }));

    for (const sub of catSubs) {
      const subItems = catItems.filter((e) => e.subcategory_id === sub.id);
      if (subItems.length === 0) continue;
      subGroups.push({ sub, rows: sortRows(subItems) });
    }

    const orphan = catItems.filter((e) => !e.subcategory_id || !catSubs.find((s) => s.id === e.subcategory_id));
    if (orphan.length > 0) {
      subGroups.push({ sub: null, rows: sortRows(orphan) });
    }

    if (subGroups.length > 0) groups.push({ cat, subs: subGroups });
  }

  // --- Render ---
  let cursorY = headerHeight + 16;

  const ensureSpace = (needed: number) => {
    if (cursorY + needed > pageHeight - 48) {
      doc.addPage();
      cursorY = 16;
    }
  };

  const CAT_BAR_H = 60;
  const SUB_BAR_H = 20;

  groups.forEach((group, idx) => {
    // Category always starts on a new page (except first)

    // Category title bar: red-600 bg, white text
    doc.setFillColor(153, 27, 27);
    doc.rect(0, cursorY, pageWidth, CAT_BAR_H, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(group.cat.name.toUpperCase(), marginX, cursorY + CAT_BAR_H / 2 + 2);
    cursorY += CAT_BAR_H + 12;

    for (const sg of group.subs) {
      // 8pt spacer before subcategory
      cursorY += 4;
      ensureSpace(SUB_BAR_H + 20);

      if (sg.sub) {
        // Subcategory bar: gray-200 bg, red-800 text
        doc.setFillColor(229, 231, 235);
        doc.rect(marginX, cursorY - 4, pageWidth - marginX * 2, SUB_BAR_H, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(153, 27, 27);
        doc.text(sg.sub.name.toUpperCase(), marginX + 4, cursorY + SUB_BAR_H / 2 + 1);
        cursorY += SUB_BAR_H + 8;
      }

      autoTable(doc, {
        startY: cursorY,
        margin: { left: marginX, right: marginX },
        body: sg.rows.map((r) => [r.name, r.price]),
        theme: "plain",
        styles: {
          font: "helvetica",
          fontSize: 10,
          textColor: [30, 30, 30],
          cellPadding: { top: 3, right: 6, bottom: 3, left: 0 },
          lineWidth: 0,
        },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { cellWidth: 90, halign: "right" },
        },
      });

      // @ts-expect-error lastAutoTable
      cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 10;
    }
  });

  // Footer page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`${i} / ${pageCount}`, pageWidth - marginX, pageHeight - 24, {
      align: "right",
    });
  }

  doc.save("equipos-ala-norte.pdf");
}
