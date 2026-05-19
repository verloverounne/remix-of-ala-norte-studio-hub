// One-shot cleanup: removes orphan objects from public storage buckets
// that are NOT referenced anywhere in the database tables nor in app code.
// POST { dryRun?: boolean } -> returns counts and (in dry run) sample names.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Names hardcoded in the application code that must be preserved regardless of DB refs.
const HARDCODED_KEEP: Record<string, string[]> = {
  "equipment-images": [
    "1768951104500_camara_fondo_blanco_gonzalo.mp4",
    "1768955781959_hero_rental.mp4",
    "1768956131991_rental_vertical.mp4",
    "36-1 3.JPG",
    "360.jpg",
    "361.jpg",
    "363.jpg",
    "gallery_1775335547737_plano_galeria.png",
    "multicamara.mp4",
    "sala.mp4",
    "tecnicos.mp4",
    "hero_galeria_1768776126818_alanorte_galerias_hero.mp4",
    "1769294018876_nanlux_evoke_1200b_led_bi_color_1726270.jpg",
  ],
  "publicimages": [
    "uiu/Logo_Horizontal_blanco.png",
    "uiu/logoHblanco.png",
    "uiu/logoVBlanco@2x.png",
    "uiu/logoVnegro@4x.png",
    "heros/presupeusto.jpeg",
  ],
};

function extractPaths(text: string, bucket: string): string[] {
  const re = new RegExp(`storage/v1/object/public/${bucket}/+([^"' )<>\n]+)`, "g");
  const out: string[] = [];
  let m;
  while ((m = re.exec(text))) out.push(decodeURIComponent(m[1]));
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const body = await req.json().catch(() => ({}));
  const dryRun: boolean = body.dryRun !== false; // default true for safety

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Gather all DB-referenced URLs
  const refSet = new Set<string>();
  const addRef = (s?: string | null) => {
    if (!s) return;
    for (const b of Object.keys(HARDCODED_KEEP)) {
      for (const p of extractPaths(s, b)) refSet.add(`${b}::${p}`);
    }
  };

  const [eq, ei, sp, gi, hs, sh, ehc, ba] = await Promise.all([
    supa.from("equipment").select("image_url,images"),
    supa.from("equipment_images").select("image_url"),
    supa.from("spaces").select("video_url,featured_image,tour_360_url,images"),
    supa.from("gallery_images").select("image_url,vertical_video_url"),
    supa.from("home_services").select("image_url,hero_image_url,hero_video_url,section_video_url"),
    supa.from("services_hero").select("hero_media_url"),
    supa.from("equipos_hero_config").select("media_url"),
    supa.from("blog_articles").select("image_url"),
  ]);

  for (const r of eq.data ?? []) {
    addRef(r.image_url);
    if (Array.isArray(r.images)) for (const u of r.images) addRef(u as string);
  }
  for (const r of ei.data ?? []) addRef(r.image_url);
  for (const r of sp.data ?? []) {
    addRef(r.video_url); addRef(r.featured_image); addRef(r.tour_360_url);
    if (Array.isArray(r.images)) for (const u of r.images) addRef(u as string);
  }
  for (const r of gi.data ?? []) { addRef(r.image_url); addRef(r.vertical_video_url); }
  for (const r of hs.data ?? []) {
    addRef(r.image_url); addRef(r.hero_image_url);
    addRef(r.hero_video_url); addRef(r.section_video_url);
  }
  for (const r of sh.data ?? []) addRef(r.hero_media_url);
  for (const r of ehc.data ?? []) addRef(r.media_url);
  for (const r of ba.data ?? []) addRef(r.image_url);

  // Add hardcoded keeps
  for (const [b, names] of Object.entries(HARDCODED_KEEP)) {
    for (const n of names) refSet.add(`${b}::${n}`);
  }

  const result: Record<string, { total: number; orphans: number; deleted: number; bytesFreed: number; sample: string[] }> = {};

  for (const bucket of Object.keys(HARDCODED_KEEP)) {
    let offset = 0;
    const all: { name: string; metadata: any }[] = [];
    // Recursive walk
    const walk = async (prefix: string) => {
      let page = 0;
      while (true) {
        const { data, error } = await supa.storage.from(bucket).list(prefix, {
          limit: 1000, offset: page * 1000,
        });
        if (error) throw error;
        if (!data || data.length === 0) break;
        for (const item of data) {
          const full = prefix ? `${prefix}/${item.name}` : item.name;
          if (item.id === null) {
            // folder
            await walk(full);
          } else {
            all.push({ name: full, metadata: item.metadata });
          }
        }
        if (data.length < 1000) break;
        page++;
      }
    };
    await walk("");

    const orphans = all.filter((o) => !refSet.has(`${bucket}::${o.name}`));
    let bytes = 0;
    for (const o of orphans) bytes += Number(o.metadata?.size ?? 0);

    let deleted = 0;
    if (!dryRun && orphans.length > 0) {
      // Delete in chunks of 200
      for (let i = 0; i < orphans.length; i += 200) {
        const chunk = orphans.slice(i, i + 200).map((o) => o.name);
        const { data, error } = await supa.storage.from(bucket).remove(chunk);
        if (error) {
          console.error("delete error", bucket, error);
        } else {
          deleted += data?.length ?? 0;
        }
      }
    }

    result[bucket] = {
      total: all.length,
      orphans: orphans.length,
      deleted,
      bytesFreed: bytes,
      sample: orphans.slice(0, 10).map((o) => o.name),
    };
  }

  return new Response(JSON.stringify({ dryRun, result }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
