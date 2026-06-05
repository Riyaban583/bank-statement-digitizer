import { useState, useRef, useCallback } from "react";

const SAMPLE_TRANSACTIONS = [
  { id: 1, date: "2024-01-03", description: "SALARY CREDIT - ACME CORP", type: "credit", amount: 85000, balance: 112450, category: "Income" },
  { id: 2, date: "2024-01-05", description: "SWIGGY ORDER #4923841", type: "debit", amount: 1240, balance: 111210, category: "Food" },
  { id: 3, date: "2024-01-07", description: "UPI/ZOMATO TECHNOLOGIES", type: "debit", amount: 890, balance: 110320, category: "Food" },
  { id: 4, date: "2024-01-09", description: "ATM WITHDRAWAL - SBI ATM UDAIPUR", type: "debit", amount: 5000, balance: 105320, category: "Cash" },
  { id: 5, date: "2024-01-11", description: "AMAZON PRIME ANNUAL", type: "debit", amount: 1499, balance: 103821, category: "Subscriptions" },
  { id: 6, date: "2024-01-14", description: "ELECTRICITY BILL - AVVNL", type: "debit", amount: 2340, balance: 101481, category: "Utilities" },
  { id: 7, date: "2024-01-18", description: "FREELANCE PAYMENT - UPWORK", type: "credit", amount: 23500, balance: 124981, category: "Income" },
  { id: 8, date: "2024-01-20", description: "NETFLIX SUBSCRIPTION", type: "debit", amount: 649, balance: 124332, category: "Subscriptions" },
  { id: 9, date: "2024-01-22", description: "PETROL - BHARAT PETROLEUM", type: "debit", amount: 3200, balance: 121132, category: "Transport" },
  { id: 10, date: "2024-01-25", description: "RENT PAYMENT - NEFT", type: "debit", amount: 18000, balance: 103132, category: "Housing" },
];

const CATEGORIES = ["All", "Income", "Food", "Transport", "Utilities", "Housing", "Subscriptions", "Cash", "Shopping", "Healthcare", "Other"];
const CATEGORY_COLORS = {
  Income: { bg: "#e6f9f0", text: "#0a7c47", border: "#a8e8c8" },
  Food: { bg: "#fff4e6", text: "#b35c00", border: "#f9c88a" },
  Transport: { bg: "#e8f0ff", text: "#1a40b8", border: "#9db4f7" },
  Utilities: { bg: "#f0e8ff", text: "#5a1ab0", border: "#c4a0f6" },
  Housing: { bg: "#fff0f0", text: "#b51a1a", border: "#f7a0a0" },
  Subscriptions: { bg: "#e8f9ff", text: "#0a6e8c", border: "#8adaf6" },
  Cash: { bg: "#f5f5f0", text: "#4a4a3a", border: "#c8c8b8" },
  Shopping: { bg: "#fff8e6", text: "#8c5500", border: "#f6d080" },
  Healthcare: { bg: "#e6fff4", text: "#0a7840", border: "#88e8b8" },
  Other: { bg: "#f2f2f2", text: "#555", border: "#ccc" },
};

function CategoryBadge({ category }) {
  const c = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20,
      letterSpacing: "0.01em", whiteSpace: "nowrap"
    }}>{category}</span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: 12, padding: "16px 20px", flex: 1, minWidth: 130,
      borderTop: `3px solid ${accent}`
    }}>
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6, letterSpacing: "0.03em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function UploadZone({ onFileSelect, loading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") onFileSelect(file);
  }, [onFileSelect]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !loading && inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? "#4f6ef7" : "var(--color-border-secondary)"}`,
        borderRadius: 16, padding: "48px 32px", textAlign: "center",
        cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
        background: dragging ? "#f0f4ff" : "var(--color-background-secondary)",
        opacity: loading ? 0.6 : 1
      }}
    >
      <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }}
        onChange={e => e.target.files[0] && onFileSelect(e.target.files[0])} />
      <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 8 }}>
        {loading ? "Processing your statement…" : "Drop your bank statement PDF here"}
      </div>
      <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
        {loading ? "AI is extracting and categorizing transactions" : "or click to browse · Supports password-protected PDFs"}
      </div>
      {loading && (
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%", background: "#4f6ef7",
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

function TransactionRow({ tx, idx }) {
  const isCredit = tx.type === "credit";
  return (
    <tr style={{
      background: idx % 2 === 0 ? "var(--color-background-primary)" : "var(--color-background-secondary)",
      transition: "background 0.1s"
    }}>
      <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
        {new Date(tx.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
      </td>
      <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--color-text-primary)", maxWidth: 280 }}>
        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.description}</div>
      </td>
      <td style={{ padding: "10px 16px" }}><CategoryBadge category={tx.category} /></td>
      <td style={{ padding: "10px 16px", textAlign: "right", fontSize: 13, fontWeight: 600,
        color: isCredit ? "#0a7c47" : "#b51a1a", fontFamily: "monospace", whiteSpace: "nowrap" }}>
        {isCredit ? "+" : "−"}₹{tx.amount.toLocaleString("en-IN")}
      </td>
      <td style={{ padding: "10px 16px", textAlign: "right", fontSize: 13,
        color: "var(--color-text-secondary)", fontFamily: "monospace", whiteSpace: "nowrap" }}>
        ₹{tx.balance.toLocaleString("en-IN")}
      </td>
      <td style={{ padding: "10px 16px" }}>
        <span style={{
          display: "inline-block", width: 8, height: 8, borderRadius: "50%",
          background: isCredit ? "#22c573" : "#ef4444", marginRight: 4
        }} />
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          {isCredit ? "Credit" : "Debit"}
        </span>
      </td>
    </tr>
  );
}

function SpendingChart({ transactions }) {
  const categories = {};
  transactions.filter(t => t.type === "debit").forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });
  const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = Math.max(...sorted.map(([, v]) => v));
  const colors = ["#4f6ef7", "#22c573", "#f59e0b", "#ef4444", "#a855f7", "#14b8a6"];

  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 16 }}>Spending by category</div>
      {sorted.map(([cat, amt], i) => (
        <div key={cat} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{cat}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)", fontFamily: "monospace" }}>
              ₹{amt.toLocaleString("en-IN")}
            </span>
          </div>
          <div style={{ height: 6, background: "var(--color-border-tertiary)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${(amt / max) * 100}%`,
              background: colors[i], borderRadius: 3,
              transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)"
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AIInsightsPanel({ transactions, loading, onAsk }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [thinking, setThinking] = useState(false);
  const [asked, setAsked] = useState(false);

  const presets = [
    "What are my biggest expense categories?",
    "Am I spending too much on food?",
    "Summarize my cash flow this month",
    "What subscriptions am I paying for?"
  ];

  const ask = async (q) => {
    const query = q || question;
    if (!query.trim()) return;
    setThinking(true); setAsked(true);
    const result = await onAsk(query, transactions);
    setAnswer(result); setThinking(false);
  };

  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>✦</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>AI insights</span>
        <span style={{ fontSize: 11, background: "#f0f4ff", color: "#4f6ef7", padding: "2px 8px", borderRadius: 20, border: "1px solid #c0d0ff" }}>Powered by Claude</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {presets.map(p => (
          <button key={p} onClick={() => { setQuestion(p); ask(p); }}
            style={{ fontSize: 12, padding: "4px 10px", border: "0.5px solid var(--color-border-secondary)",
              borderRadius: 20, background: "var(--color-background-secondary)",
              color: "var(--color-text-secondary)", cursor: "pointer" }}>
            {p}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input value={question} onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === "Enter" && ask()}
          placeholder="Ask anything about your transactions…"
          style={{ flex: 1, fontSize: 13, padding: "8px 12px", borderRadius: 8,
            border: "0.5px solid var(--color-border-secondary)",
            background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }} />
        <button onClick={() => ask()}
          style={{ padding: "8px 16px", background: "#4f6ef7", color: "#fff", border: "none",
            borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          Ask
        </button>
      </div>

      {asked && (
        <div style={{ marginTop: 14, padding: "12px 14px", background: "var(--color-background-secondary)",
          borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)" }}>
          {thinking ? (
            <div style={{ color: "var(--color-text-secondary)", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 14, height: 14, border: "2px solid #4f6ef7", borderTopColor: "transparent",
                borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Analyzing transactions…
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{answer}</div>
          )}
        </div>
      )}
    </div>
  );
}

function ExportBar({ transactions }) {
  const exportCSV = () => {
    const headers = ["Date", "Description", "Category", "Type", "Amount", "Balance"];
    const rows = transactions.map(t => [t.date, `"${t.description}"`, t.category, t.type, t.amount, t.balance]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "transactions.csv"; a.click();
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button onClick={exportCSV} style={{
        fontSize: 13, padding: "6px 14px", border: "0.5px solid var(--color-border-secondary)",
        borderRadius: 8, background: "var(--color-background-secondary)",
        color: "var(--color-text-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6
      }}>
        ↓ Export CSV
      </button>
      <button onClick={() => window.print()} style={{
        fontSize: 13, padding: "6px 14px", border: "0.5px solid var(--color-border-secondary)",
        borderRadius: 8, background: "var(--color-background-secondary)",
        color: "var(--color-text-primary)", cursor: "pointer"
      }}>
        🖨 Print
      </button>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("upload"); // upload | dashboard
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fileName, setFileName] = useState("");
  const [activeTab, setActiveTab] = useState("transactions"); // transactions | analytics

  const callClaude = async (prompt) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await res.json();
    return data.content?.[0]?.text || "";
  };

  const handleFileUpload = async (file) => {
    setLoading(true); setError(""); setFileName(file.name);
    try {
      // Read file as base64
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = () => rej(new Error("Failed to read file"));
        r.readAsDataURL(file);
      });

      // Use Claude to extract and parse transactions from PDF
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: base64 }
              },
              {
                type: "text",
                text: `Extract all transactions from this bank statement PDF. Return ONLY a valid JSON array — no markdown, no explanation, no backticks.

Each transaction must have: date (YYYY-MM-DD), description (string), type ("credit" or "debit"), amount (number in INR, no commas), balance (running balance as number), category (one of: Income, Food, Transport, Utilities, Housing, Subscriptions, Cash, Shopping, Healthcare, Other).

If no transactions can be found, return an empty array [].
If this is not a bank statement, return [].

Respond with ONLY the JSON array.`
              }
            ]
          }]
        })
      });

      const data = await res.json();
      let raw = data.content?.[0]?.text?.trim() || "[]";
      // Strip markdown fences if any
      raw = raw.replace(/```json|```/g, "").trim();
      let parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("No transactions found in the PDF. Please ensure this is a valid bank statement.");
      }
      // Add IDs
      parsed = parsed.map((t, i) => ({ ...t, id: i + 1 }));
      setTransactions(parsed);
      setView("dashboard");
    } catch (e) {
      setError(e.message || "Failed to process the PDF. Try again.");
    }
    setLoading(false);
  };

  const handleAskAI = async (question, txList) => {
    const summary = txList.slice(0, 40).map(t =>
      `${t.date}|${t.type}|${t.category}|${t.description.slice(0, 40)}|₹${t.amount}`
    ).join("\n");
    const prompt = `You are a personal finance assistant. Here are the user's bank transactions:\n${summary}\n\nUser question: ${question}\n\nGive a concise, helpful answer in 2-4 sentences. Be specific with numbers where relevant.`;
    return callClaude(prompt);
  };

  const useDemoData = () => {
    setTransactions(SAMPLE_TRANSACTIONS);
    setFileName("demo_statement.pdf");
    setView("dashboard");
  };

  // Filter + sort
  const filtered = transactions
    .filter(t => {
      const q = search.toLowerCase();
      if (q && !t.description.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false;
      if (filterCategory !== "All" && t.category !== filterCategory) return false;
      if (filterType !== "All" && t.type !== filterType) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      if (sortBy === "amount") return b.amount - a.amount;
      if (sortBy === "description") return a.description.localeCompare(b.description);
      return 0;
    });

  const totalCredit = transactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalDebit = transactions.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);
  const balance = transactions.length > 0 ? transactions[transactions.length - 1]?.balance || 0 : 0;

  const tabs = ["transactions", "analytics"];

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        tr:hover td { background: var(--color-background-info) !important; }
        button:hover { filter: brightness(0.95); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: var(--color-border-secondary); border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "#4f6ef7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏦</div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>StatementAI</span>
            <span style={{ fontSize: 11, color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", padding: "2px 8px", borderRadius: 20, border: "0.5px solid var(--color-border-tertiary)" }}>beta</span>
          </div>
          {view === "dashboard" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setView("upload"); setTransactions([]); }}
                style={{ fontSize: 13, padding: "6px 14px", border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: 8, background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                ← Upload new
              </button>
              <ExportBar transactions={transactions} />
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px" }}>

        {/* UPLOAD VIEW */}
        {view === "upload" && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
                Digitize your bank statement
              </h1>
              <p style={{ fontSize: 15, color: "var(--color-text-secondary)", margin: 0 }}>
                Upload any PDF bank statement — AI extracts, parses, and categorizes every transaction instantly.
              </p>
            </div>

            <UploadZone onFileSelect={handleFileUpload} loading={loading} />

            {error && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--color-background-danger)",
                border: "0.5px solid var(--color-border-danger)", borderRadius: 8, fontSize: 13, color: "var(--color-text-danger)" }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <input value={password} onChange={e => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Password (if PDF is protected)"
                style={{ flex: 1, fontSize: 13, padding: "8px 12px", borderRadius: 8,
                  border: "0.5px solid var(--color-border-secondary)",
                  background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }} />
              <button onClick={() => setShowPassword(s => !s)}
                style={{ fontSize: 12, padding: "8px 12px", border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: 8, background: "var(--color-background-secondary)", cursor: "pointer", color: "var(--color-text-secondary)" }}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: 24, color: "var(--color-text-secondary)", fontSize: 13 }}>— or —</div>

            <button onClick={useDemoData} style={{
              width: "100%", marginTop: 12, padding: "12px", fontSize: 14, fontWeight: 500,
              border: "0.5px solid var(--color-border-secondary)", borderRadius: 12,
              background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", cursor: "pointer"
            }}>
              Try with sample data
            </button>

            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { icon: "🔒", label: "Secure", desc: "Processed by Claude API, never stored" },
                { icon: "⚡", label: "Instant", desc: "Extract 100s of transactions in seconds" },
                { icon: "🤖", label: "AI-powered", desc: "Automatic categorization & insights" },
              ].map(f => (
                <div key={f.label} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {view === "dashboard" && (
          <div>
            {/* File info */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>📄</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{fileName}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{transactions.length} transactions extracted</div>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <StatCard label="Total credits" value={`₹${totalCredit.toLocaleString("en-IN")}`} sub={`${transactions.filter(t => t.type === "credit").length} transactions`} accent="#22c573" />
              <StatCard label="Total debits" value={`₹${totalDebit.toLocaleString("en-IN")}`} sub={`${transactions.filter(t => t.type === "debit").length} transactions`} accent="#ef4444" />
              <StatCard label="Net flow" value={`₹${(totalCredit - totalDebit).toLocaleString("en-IN")}`} sub={totalCredit > totalDebit ? "Net positive" : "Net negative"} accent={totalCredit >= totalDebit ? "#22c573" : "#ef4444"} />
              <StatCard label="Closing balance" value={`₹${balance.toLocaleString("en-IN")}`} sub="As of last transaction" accent="#4f6ef7" />
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 2, marginBottom: 16, borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: 0 }}>
              {tabs.map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  fontSize: 13, fontWeight: 500, padding: "8px 16px", border: "none",
                  background: "transparent", cursor: "pointer", color: activeTab === t ? "#4f6ef7" : "var(--color-text-secondary)",
                  borderBottom: activeTab === t ? "2px solid #4f6ef7" : "2px solid transparent",
                  marginBottom: -1, textTransform: "capitalize"
                }}>{t}</button>
              ))}
            </div>

            {activeTab === "transactions" && (
              <div>
                {/* Filters */}
                <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search transactions…"
                    style={{ flex: 1, minWidth: 180, fontSize: 13, padding: "7px 12px", borderRadius: 8,
                      border: "0.5px solid var(--color-border-secondary)",
                      background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }} />
                  <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                    style={{ fontSize: 13, padding: "7px 10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
                      background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    style={{ fontSize: 13, padding: "7px 10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
                      background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }}>
                    <option>All</option><option value="credit">Credits</option><option value="debit">Debits</option>
                  </select>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    style={{ fontSize: 13, padding: "7px 10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
                      background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }}>
                    <option value="date">Sort: Date</option>
                    <option value="amount">Sort: Amount</option>
                    <option value="description">Sort: Name</option>
                  </select>
                </div>

                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 10 }}>
                  Showing {filtered.length} of {transactions.length} transactions
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto", borderRadius: 12, border: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-primary)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                    <colgroup>
                      <col style={{ width: 100 }} />
                      <col style={{ width: "auto" }} />
                      <col style={{ width: 120 }} />
                      <col style={{ width: 120 }} />
                      <col style={{ width: 130 }} />
                      <col style={{ width: 90 }} />
                    </colgroup>
                    <thead>
                      <tr style={{ background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                        {["Date", "Description", "Category", "Amount", "Balance", "Type"].map(h => (
                          <th key={h} style={{ padding: "10px 16px", textAlign: h === "Amount" || h === "Balance" ? "right" : "left",
                            fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)",
                            textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--color-text-secondary)", fontSize: 14 }}>
                          No transactions match your filters
                        </td></tr>
                      ) : filtered.map((tx, i) => <TransactionRow key={tx.id} tx={tx} idx={i} />)}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <SpendingChart transactions={filtered.length ? filtered : transactions} />
                <AIInsightsPanel transactions={transactions} onAsk={handleAskAI} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
