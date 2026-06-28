"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
 
export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Scripts");
  const [price, setPrice] = useState("0");
  const [isFree, setIsFree] = useState(true);
  const [videoUrl, setVideoUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
 
  async function handleSubmit() {
    if (!title || !downloadUrl) return alert("Βάλε τίτλο και download link!");
    setLoading(true);
 
    let imageUrl = "";
 
    if (imageFile) {
      const { data } = await supabase.storage
        .from("resources")
        .upload(`images/${Date.now()}_${imageFile.name}`, imageFile);
      if (data) {
        const { data: urlData } = supabase.storage.from("resources").getPublicUrl(data.path);
        imageUrl = urlData.publicUrl;
      }
    }
 
    await supabase.from("resources").insert({
      title,
      description,
      category,
      price: parseFloat(price),
      is_free: isFree,
      image_url: imageUrl,
      download_url: downloadUrl,
      video_url: videoUrl || null,
      downloads: 0,
    });
 
    setLoading(false);
    setSuccess(true);
    setTitle("");
    setDescription("");
    setPrice("0");
    setVideoUrl("");
    setDownloadUrl("");
    setImageFile(null);
  }
 
  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white p-8">
      <h1 className="text-2xl font-black text-yellow-400 mb-8">Admin Panel</h1>
 
      {success && (
        <div className="bg-green-900 text-green-400 px-4 py-3 rounded mb-6">
          ✅ Resource ανέβηκε επιτυχώς!
        </div>
      )}
 
      <div className="max-w-xl space-y-4">
        <div>
          <label className="text-gray-400 text-sm mb-1 block">Τίτλος</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
            placeholder="π.χ. Downtown MLO" />
        </div>
 
        <div>
          <label className="text-gray-400 text-sm mb-1 block">Περιγραφή</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400 h-24"
            placeholder="Περιγραφή του resource..." />
        </div>
 
        <div>
          <label className="text-gray-400 text-sm mb-1 block">Κατηγορία</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white focus:outline-none">
            {["Scripts", "MLO", "Vehicles", "Clothing", "Maps"].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
 
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-gray-400 text-sm mb-1 block">Τιμή (€)</label>
            <input value={price} onChange={e => setPrice(e.target.value)}
              type="number" min="0"
              className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
              placeholder="0" />
          </div>
          <div className="flex items-end pb-2 gap-2">
            <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} id="free" />
            <label htmlFor="free" className="text-gray-400 text-sm">Free</label>
          </div>
        </div>
 
        <div>
          <label className="text-gray-400 text-sm mb-1 block">Εικόνα Preview</label>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)}
            className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-gray-400 text-sm" />
        </div>
 
        <div>
          <label className="text-gray-400 text-sm mb-1 block">Video URL (YouTube/Streamable κλπ)</label>
          <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
            className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
            placeholder="https://youtube.com/watch?v=..." />
        </div>
 
        <div>
          <label className="text-gray-400 text-sm mb-1 block">Download Link (Google Drive / Mediafire)</label>
          <input value={downloadUrl} onChange={e => setDownloadUrl(e.target.value)}
            className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
            placeholder="https://drive.google.com/..." />
          <p className="text-gray-600 text-xs mt-1">Ανέβασε το αρχείο στο Google Drive και βάλε το shareable link εδώ.</p>
        </div>
 
        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-yellow-400 text-black font-black py-3 rounded hover:bg-yellow-300 transition disabled:opacity-50">
          {loading ? "Ανεβάζω..." : "Upload Resource"}
        </button>
      </div>
    </main>
  );
}
 
