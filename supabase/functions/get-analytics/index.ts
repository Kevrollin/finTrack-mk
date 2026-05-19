// supabase/functions/get-analytics/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: { method: string; headers: { get: (arg0: string) => any; }; url: string | URL; }) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const year = parseInt(url.searchParams.get("year") || new Date().getFullYear().toString());
    const month = parseInt(url.searchParams.get("month") || (new Date().getMonth() + 1).toString());

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    // Monthly transactions with categories
    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select(`*, categories(id, name, icon, color)`)
      .eq("user_id", user.id)
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate)
      .order("transaction_date", { ascending: false });

    if (txError) throw txError;

    // Aggregate by category
    const categoryTotals: Record<string, { name: string; icon: string; color: string; total: number; count: number }> = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const tx of transactions || []) {
      if (tx.type === "income") {
        totalIncome += parseFloat(tx.amount);
      } else {
        totalExpenses += parseFloat(tx.amount);
        const cat = tx.categories;
        const catKey = cat?.id || "uncategorized";
        if (!categoryTotals[catKey]) {
          categoryTotals[catKey] = {
            name: cat?.name || "Uncategorized",
            icon: cat?.icon || "package",
            color: cat?.color || "#6b7280",
            total: 0,
            count: 0,
          };
        }
        categoryTotals[catKey].total += parseFloat(tx.amount);
        categoryTotals[catKey].count += 1;
      }
    }

    // Daily spending for chart
    const dailyMap: Record<string, { date: string; expenses: number; income: number }> = {};
    for (const tx of transactions || []) {
      const d = tx.transaction_date;
      if (!dailyMap[d]) dailyMap[d] = { date: d, expenses: 0, income: 0 };
      if (tx.type === "expense") dailyMap[d].expenses += parseFloat(tx.amount);
      else dailyMap[d].income += parseFloat(tx.amount);
    }

    // Last 6 months summary
    const monthlyHistory = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const mStart = `${y}-${String(m).padStart(2, "0")}-01`;
      const mEnd = new Date(y, m, 0).toISOString().split("T")[0];

      const { data: mTx } = await supabase
        .from("transactions")
        .select("amount, type")
        .eq("user_id", user.id)
        .gte("transaction_date", mStart)
        .lte("transaction_date", mEnd);

      const mIncome = (mTx || []).filter(t => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
      const mExpenses = (mTx || []).filter(t => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);
      monthlyHistory.push({ month: m, year: y, income: mIncome, expenses: mExpenses });
    }

    return new Response(JSON.stringify({
      data: {
        totalIncome,
        totalExpenses,
        netSavings: totalIncome - totalExpenses,
        categoryBreakdown: Object.entries(categoryTotals)
          .map(([id, v]) => ({ id, ...v, percentage: totalExpenses > 0 ? (v.total / totalExpenses) * 100 : 0 }))
          .sort((a, b) => b.total - a.total),
        dailySpending: Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)),
        monthlyHistory,
        transactionCount: (transactions || []).length,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
