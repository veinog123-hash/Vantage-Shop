"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function SuccessContent() {
  const searchParams = useSearchParams();
  const resourceId = searchParams.get("resource_id");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    async function fetchResource() {
      if (!resourceId) return;
      const { data } = await supabase
        .from("resources")
        .select("*")
        .eq("id", resourceId)
        .single();
      if (data) {
        setDownloadUrl(data.download_url);
        setTitle(data.title);
      }
    }
    fetchResource();
  }, [resourceId]);

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-black text-yellow-400 mb-4">✅ Η πληρωμή ολοκληρώθηκε!</h1>
        {title && <p className="text-gray-400 mb-6">{title}</p>}
        {downloadUrl ? (
          <a href={downloadUrl} className="bg-yellow-400 text-black font-black px-6 py-3 rounded inline-block hover:bg-yellow-300 transition">
            Κατέβασε το αρχείο
          </a>
        ) : (
          <p className="text-gray-500">Φόρτωση...</p>
        )}
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0d0d]" />}>
      <SuccessContent />
    </Suspense>
  );
}