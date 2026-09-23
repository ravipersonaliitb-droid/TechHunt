"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function TestSupabasePage() {
  const [message, setMessage] = useState("Testing Supabase connection...");

  useEffect(() => {
    async function testConnection() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("articles")
        .select("id, title, status")
        .limit(5);

      if (error) {
        setMessage(`Connection error: ${error.message}`);
        return;
      }

      setMessage(
        `Supabase connected successfully. Articles found: ${data?.length ?? 0}`
      );
    }

    testConnection();
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Supabase Test</h1>

        <p className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6 text-zinc-300">
          {message}
        </p>
      </div>
    </main>
  );
}