"use client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";

type Resource = {
  id: string;
  title: string;
  category: string;
  is_free: boolean;
  price: number;
  image_url: string;
  download_url: string;
  downloads: number;
  created_at: string;
};

export default function ResourceCard({ r }: { r: Resource }) {
  const [showPayment, setShowPayment] = useState(false);

  async function handleClick() {
    if (r.is_free) {
      window.open(r.download_url, "_blank");
      return;
    }
    setShowPayment(true);
  }

  return (
    <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden hover:border-yellow-400 transition">
      <div onClick={handleClick} className="cursor-pointer">
        <div className="relative bg-[#1a1a1a] h-40 flex items-center justify-center overflow-hidden">
          {r.image_url ? (
            <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-600 text-sm">Preview</span>
          )}
          <span className="absolute top-2 right-2 bg-[#222] text-gray-300 text-xs px-2 py-0.5 rounded">{r.category}</span>
        </div>
        <div className="p-3">
          <div className="font-bold text-sm mb-2">{r.title}</div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>📅 {new Date(r.created_at).toLocaleDateString("el-GR")}</span>
            <span>⬇️ {(r.downloads || 0).toLocaleString()}</span>
            <span className={`font-bold ${r.is_free ? "text-green-400" : "text-purple-400"}`}>
              {r.is_free ? "Free" : `${r.price}€`}
            </span>
          </div>
        </div>
      </div>

      {showPayment && !r.is_free && (
        <div className="p-3 border-t border-[#222]">
          <p className="text-gray-400 text-xs mb-3 text-center">Επίλεξε τρόπο πληρωμής:</p>
          
          {/* Stripe */}
          <button
            onClick={async () => {
              const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resourceId: r.id }),
              });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}
            className="w-full bg-yellow-400 text-black font-black py-2 rounded mb-2 hover:bg-yellow-300 transition text-sm"
          >
            💳 Πληρωμή με Κάρτα (Stripe)
          </button>

          {/* PayPal */}
          <PayPalScriptProvider options={{
            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
            currency: "EUR"
          }}>
            <PayPalButtons
              style={{ layout: "horizontal", height: 40 }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  intent: "CAPTURE",
                  purchase_units: [{
                    amount: { currency_code: "EUR", value: r.price.toString() },
                    description: r.title,
                  }],
                });
              }}
              onApprove={async (data, actions) => {
                await actions.order!.capture();
                window.location.href = `/success?resource_id=${r.id}`;
              }}
            />
          </PayPalScriptProvider>

          <button onClick={() => setShowPayment(false)} className="w-full text-gray-500 text-xs mt-2 hover:text-gray-300">
            Ακύρωση
          </button>
        </div>
      )}
    </div>
  );
}