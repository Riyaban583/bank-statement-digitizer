import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";

import Navbar from "../components/Navbar";
import {
  Card,
  Button,
  Badge,
  Input,
  Select,
  Field,
  StatCard,
  TabButton,
} from "../components/ui";
import TransactionsTable from "../components/transactions/TransactionsTable";
import ReconciliationTab from "../components/transactions/ReconciliationTab";
import { isTxnMatched } from "../utils/matching";
import { formatCurrency, toISODate } from "../utils/format";

const CATEGORIES = [
  "All",
  "Salary",
  "Food",
  "Rent",
  "Utility",
  "ATM",
  "Transfer",
  "Other",
];

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Data
  const [transactions, setTransactions] = useState([]);
  const [statements, setStatements] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI
  const [tab, setTab] = useState("transactions");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("search") || ""
  );
  const [fromDate, setFromDate] = useState(
    () => searchParams.get("fromDate") || ""
  );
  const [toDate, setToDate] = useState(() => searchParams.get("toDate") || "");
  const [minAmount, setMinAmount] = useState(
    () => searchParams.get("minAmount") || ""
  );
  const [maxAmount, setMaxAmount] = useState(
    () => searchParams.get("maxAmount") || ""
  );
  const [transactionType, setTransactionType] = useState(
    () => searchParams.get("type") || "all"
  );
  const [statusFilter, setStatusFilter] = useState(
    () => searchParams.get("status") || "all"
  );
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedStatement, setSelectedStatement] = useState(
    () => searchParams.get("statementId") || ""
  );

  /* --------------------------------------------------------- Fetching */
  useEffect(() => {
    const fetchCollection = async (name, uid) => {
      const q = query(collection(db, name), where("userId", "==", uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        // ✅ FIX: debit/credit/balance ko Number mein convert karo
        // Firestore kabhi kabhi string store kar leta hai
        return {
          id: doc.id,
          ...data,
          debit: Number(data.debit) || 0,
          credit: Number(data.credit) || 0,
          balance: Number(data.balance) || 0,
        };
      });
    };

    const load = async (uid) => {
      try {
        const [txns, stmts, invs] = await Promise.all([
          fetchCollection("transactions", uid),
          fetchCollection("statements", uid),
          fetchCollection("invoices", uid),
        ]);
        // Sort by date ascending
        const toISO = (d) => d ? d.split("/").reverse().join("-") : "";
        txns.sort((a, b) => toISO(a.date).localeCompare(toISO(b.date)));
        setTransactions(txns);
        setStatements(stmts);
        setInvoices(invs);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) load(user.uid);
    });
    return () => unsubscribe();
  }, []);

  /* ----------------------------------------------------- URL sync */
  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (minAmount) params.minAmount = minAmount;
    if (maxAmount) params.maxAmount = maxAmount;
    if (transactionType !== "all") params.type = transactionType;
    if (statusFilter !== "all") params.status = statusFilter;
    if (selectedStatement) params.statementId = selectedStatement;
    setSearchParams(params, { replace: true });
  }, [
    searchTerm,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    transactionType,
    statusFilter,
    selectedStatement,
    setSearchParams,
  ]);

  const filterKey = [
    searchTerm,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    transactionType,
    statusFilter,
    categoryFilter,
    selectedStatement,
    pageSize,
  ].join("|");
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setCurrentPage(1);
  }

  /* -------------------------------------------------- Reconciliation */
  const matchedTxnIds = useMemo(() => {
    const ids = new Set();
    transactions.forEach((txn) => {
      if (isTxnMatched(txn, invoices)) ids.add(txn.id);
    });
    return ids;
  }, [transactions, invoices]);

  const isRowMatched = (txn) => matchedTxnIds.has(txn.id);

  /* -------------------------------------------------------- Filtering */
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesSearch = txn.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatement =
        selectedStatement === "" || txn.statementId === selectedStatement;

      const txnDate = toISODate(txn.date);
      const matchesFromDate = fromDate === "" || txnDate >= fromDate;
      const matchesToDate = toDate === "" || txnDate <= toDate;

      const amount = Number(txn.debit || txn.credit || 0);
      const matchesMin = minAmount === "" || amount >= Number(minAmount);
      const matchesMax = maxAmount === "" || amount <= Number(maxAmount);

      const matchesType =
        transactionType === "all"
          ? true
          : transactionType === "debit"
          ? Number(txn.debit || 0) > 0
          : Number(txn.credit || 0) > 0;

      const matchesCategory =
        categoryFilter === "All" || txn.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "matched"
          ? matchedTxnIds.has(txn.id)
          : !matchedTxnIds.has(txn.id);

      return (
        matchesSearch &&
        matchesStatement &&
        matchesFromDate &&
        matchesToDate &&
        matchesMin &&
        matchesMax &&
        matchesType &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    transactions,
    searchTerm,
    selectedStatement,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    transactionType,
    categoryFilter,
    statusFilter,
    matchedTxnIds,
  ]);

  /* ---------------------------------------------------------- Derived */
  const totalDebit = filteredTransactions.reduce(
    (sum, t) => sum + Number(t.debit || 0),
    0
  );
  const totalCredit = filteredTransactions.reduce(
    (sum, t) => sum + Number(t.credit || 0),
    0
  );
  const matchedCount = filteredTransactions.filter(isRowMatched).length;
  const unmatchedCount = filteredTransactions.length - matchedCount;

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filteredTransactions.slice(
    startIndex,
    startIndex + pageSize
  );

  /* ----------------------------------------------------------- Actions */
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredTransactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "transactions.xlsx");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
    setTransactionType("all");
    setStatusFilter("all");
    setCategoryFilter("All");
    setSelectedStatement("");
  };

  const activeChips = [
    searchTerm && { label: `Search: ${searchTerm}`, clear: () => setSearchTerm("") },
    fromDate && { label: `From: ${fromDate}`, clear: () => setFromDate("") },
    toDate && { label: `To: ${toDate}`, clear: () => setToDate("") },
    minAmount && { label: `Min: ₹${minAmount}`, clear: () => setMinAmount("") },
    maxAmount && { label: `Max: ₹${maxAmount}`, clear: () => setMaxAmount("") },
    transactionType !== "all" && {
      label: `Type: ${transactionType}`,
      clear: () => setTransactionType("all"),
    },
    statusFilter !== "all" && {
      label: `Status: ${statusFilter}`,
      clear: () => setStatusFilter("all"),
    },
    categoryFilter !== "All" && {
      label: `Category: ${categoryFilter}`,
      clear: () => setCategoryFilter("All"),
    },
  ].filter(Boolean);

  /* -------------------------------------------------------------- View */
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
            <p className="mt-1 text-sm text-slate-500">
              {filteredTransactions.length} of {transactions.length}{" "}
              transactions
            </p>
          </div>

          {/* Summary cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Transactions" value={filteredTransactions.length} />
            <StatCard
              label="Total Debit"
              value={formatCurrency(totalDebit)}
              accent="debit"
            />
            <StatCard
              label="Total Credit"
              value={formatCurrency(totalCredit)}
              accent="credit"
            />
            <StatCard label="Matched" value={matchedCount} accent="matched" />
            <StatCard
              label="Unmatched"
              value={unmatchedCount}
              accent="unmatched"
            />
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-slate-200">
            <TabButton
              active={tab === "transactions"}
              onClick={() => setTab("transactions")}
            >
              Transactions
            </TabButton>
            <TabButton
              active={tab === "reconciliation"}
              onClick={() => setTab("reconciliation")}
            >
              Reconciliation
            </TabButton>
          </div>

          {tab === "transactions" ? (
            <>
              {/* Filter bar */}
              <Card className="mb-6 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    type="text"
                    placeholder="Search by description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="sm:flex-1"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setShowFilters((v) => !v)}
                    >
                      Filters {showFilters ? "▴" : "▾"}
                    </Button>
                    <Button variant="secondary" onClick={resetFilters}>
                      Reset
                    </Button>
                    <Button onClick={exportToExcel}>Export</Button>
                  </div>
                </div>

                {showFilters && (
                  <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="From Date">
                      <Input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </Field>
                    <Field label="To Date">
                      <Input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </Field>
                    <Field label="Statement">
                      <Select
                        value={selectedStatement}
                        onChange={(e) => setSelectedStatement(e.target.value)}
                      >
                        <option value="">All Statements</option>
                        {statements.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.bank} — {s.transactionCount} txns
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Min Amount">
                      <Input
                        type="number"
                        placeholder="0"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                      />
                    </Field>
                    <Field label="Max Amount">
                      <Input
                        type="number"
                        placeholder="Any"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                      />
                    </Field>
                    <Field label="Type">
                      <Select
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="debit">Debit</option>
                        <option value="credit">Credit</option>
                      </Select>
                    </Field>
                    <Field label="Status">
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="matched">Matched</option>
                        <option value="unmatched">Unmatched</option>
                      </Select>
                    </Field>
                    <Field label="Category">
                      <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c === "All" ? "All Categories" : c}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Rows per page">
                      <Select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                      >
                        {[10, 25, 50, 100].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                )}

                {activeChips.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeChips.map((chip, i) => (
                      <button
                        key={i}
                        onClick={chip.clear}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
                      >
                        {chip.label}
                        <span className="text-slate-400">✕</span>
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              {error && (
                <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {error}
                </div>
              )}

              {/* Table */}
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <h2 className="font-semibold text-slate-800">
                    Transaction History
                  </h2>
                  <Badge variant="neutral">
                    {paginated.length} shown
                  </Badge>
                </div>

                <TransactionsTable
                  rows={paginated}
                  loading={loading}
                  isEmpty={!loading && filteredTransactions.length === 0}
                  isMatched={isRowMatched}
                />

                {filteredTransactions.length > 0 && (
                  <div className="flex items-center justify-center gap-4 border-t border-slate-200 p-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Prev
                    </Button>
                    <span className="text-sm text-slate-500">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage >= totalPages || totalPages === 0}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </Card>
            </>
          ) : (
            <ReconciliationTab
              transactions={transactions}
              invoices={invoices}
            />
          )}
        </div>
      </div>
    </>
  );
}
