import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import Navbar from "../components/Navbar";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { auth } from "../firebase/firebaseConfig";
import * as XLSX from "xlsx";
import { useSearchParams } from "react-router-dom";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] =useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [minAmount, setMinAmount] = useState("");
const [maxAmount, setMaxAmount] = useState("");
const [transactionType, setTransactionType] =
  useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [statements, setStatements] = useState([]);
const [selectedStatement, setSelectedStatement] = useState("");
const [
  searchParams,
  setSearchParams
] = useSearchParams();
const statementId =
  searchParams.get(
    "statementId"
  );
  useEffect(() => {

  const search =
    searchParams.get(
      "search"
    ) || "";

  const from =
    searchParams.get(
      "fromDate"
    ) || "";

  const to =
    searchParams.get(
      "toDate"
    ) || "";

  const min =
    searchParams.get(
      "minAmount"
    ) || "";

  const max =
    searchParams.get(
      "maxAmount"
    ) || "";

  const type =
    searchParams.get(
      "type"
    ) || "all";

  setSearchTerm(search);
  setFromDate(from);
  setToDate(to);
  setMinAmount(min);
  setMaxAmount(max);
  setTransactionType(type);

}, []);
useEffect(() => {

  const params = {};

  if (searchTerm)
    params.search = searchTerm;

  if (fromDate)
    params.fromDate = fromDate;

  if (toDate)
    params.toDate = toDate;

  if (minAmount)
    params.minAmount =
      minAmount;

  if (maxAmount)
    params.maxAmount =
      maxAmount;

  if (
    transactionType !==
    "all"
  )
    params.type =
      transactionType;

  setSearchParams(params);

}, [
  searchTerm,
  fromDate,
  toDate,
  minAmount,
  maxAmount,
  transactionType
]);

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      fetchTransactions();
      fetchStatements();
    }
  });

  return () => unsubscribe();
}, []);

  const fetchTransactions = async () => {
  try {
    console.log("Current User:", auth.currentUser);
console.log("UID:", auth.currentUser?.uid);

if (!auth.currentUser) {
  console.log("User not logged in yet");
  return;
}

    console.log(
      "statementId =",
      statementId
    );

    console.log(
      "userId =",
      auth.currentUser.uid
    );

    let q;

    if (statementId) {
      q = query(
        collection(db, "transactions"),
        where(
          "userId",
          "==",
          auth.currentUser.uid
        ),
        where(
          "statementId",
          "==",
          statementId
        )
      );
    } else {
      q = query(
        collection(db, "transactions"),
        where(
          "userId",
          "==",
          auth.currentUser.uid
        )
      );
    }

    const querySnapshot =
      await getDocs(q);

    console.log(
      "Docs Found:",
      querySnapshot.docs.length
    );

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTransactions(data);
    } catch (error) {
      console.error(
        "Error fetching transactions:",
        error
      );
       setError(
    "Failed to load transactions"
  );
    } finally {
      setLoading(false);
    }
  };
  
   const fetchStatements = async () => {
  try {
    console.log("Current User:", auth.currentUser);
console.log("UID:", auth.currentUser?.uid);

if (!auth.currentUser) {
  console.log("User not logged in yet");
  return;
}
    const q = query(
      collection(db, "statements"),
      where(
        "userId",
        "==",
        auth.currentUser.uid
      )
    );

    const snapshot =
      await getDocs(q);
      console.log("Statements Found:", snapshot.docs.length);

    const data =
      snapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );

    setStatements(data);
  } catch (error) {
    console.error(
      "Error fetching statements:",
      error
    );
  }
};

 const filteredTransactions =
  transactions.filter((txn) => {

    const matchesSearch =
      txn.description
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        );

    const matchesStatement =
      selectedStatement === ""
        ? true
        : txn.statementId ===
          selectedStatement;

    // DD/MM/YYYY -> YYYY-MM-DD
    const txnDate = txn.date
  ? txn.date.split("/").reverse().join("-")
  : "";

    const matchesFromDate =
      fromDate === ""
        ? true
        : txnDate >= fromDate;

    const matchesToDate =
      toDate === ""
        ? true
        : txnDate <= toDate;

        const amount =
  Number(
    txn.debit ||
    txn.credit ||
    0
  );

const matchesMinAmount =
  minAmount === ""
    ? true
    : amount >=
      Number(minAmount);

      const matchesMaxAmount =
  maxAmount === ""
    ? true
    : amount <= Number(maxAmount);

    const matchesType =
  transactionType === "all"
    ? true
    : transactionType ===
      "debit"
    ? Number(txn.debit || 0) > 0
    : Number(txn.credit || 0) > 0;

    const matchesCategory =
  categoryFilter === "All"
    ? true
    : txn.category ===
      categoryFilter;

  return (
  matchesSearch &&
  matchesStatement &&
  matchesFromDate &&
  matchesToDate &&
  matchesMinAmount &&
  matchesMaxAmount &&
  matchesType &&
  matchesCategory
);
  });

  const totalPages = Math.ceil(
  filteredTransactions.length / pageSize
);

const startIndex =
  (currentPage - 1) * pageSize;

const paginatedTransactions =
  filteredTransactions.slice(
    startIndex,
    startIndex + pageSize
  );

  const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(
    filteredTransactions
  );

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Transactions"
  );

  XLSX.writeFile(
    workbook,
    "transactions.xlsx"
  );
};

  const totalDebit = filteredTransactions.reduce(
    (sum, txn) => sum + Number(txn.debit || 0),
    0
  );

  const totalCredit = filteredTransactions.reduce(
    (sum, txn) => sum + Number(txn.credit || 0),
    0
  );

  const currentBalance =
    filteredTransactions.length > 0
      ? filteredTransactions[
          filteredTransactions.length - 1
        ].balance
      : 0;

  return (
     <>
    <Navbar />
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Transactions Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Total Transactions:
            <span className="font-semibold text-blue-600 ml-2">
              {filteredTransactions.length}
            </span>
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

          <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="text-gray-500 text-sm">
              Total Transactions
            </h3>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              {filteredTransactions.length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="text-gray-500 text-sm">
              Total Debit
            </h3>

            <p className="text-3xl font-bold text-red-500 mt-2">
              ₹ {totalDebit.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="text-gray-500 text-sm">
              Total Credit
            </h3>

            <p className="text-3xl font-bold text-green-500 mt-2">
              ₹ {totalCredit.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="text-gray-500 text-sm">
              Current Balance
            </h3>

            <p className="text-3xl font-bold text-purple-600 mt-2">
              ₹ {currentBalance}
            </p>
          </div>

        </div>

        {/* Search Box */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <input
            type="text"
            placeholder="Search by description..."
            value={searchTerm}
           onChange={(e) => {
  setSearchTerm(e.target.value);
  setCurrentPage(1);
}} 
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">

  <h3 className="font-semibold mb-3">
    Filter By Date
  </h3>

  <div className="grid md:grid-cols-2 gap-4">

    <input
      type="date"
      value={fromDate}
      onChange={(e) => {
  setFromDate(e.target.value);
  setCurrentPage(1);
}}
      className="border border-gray-300 rounded-lg px-4 py-2"
    />

    <input
      type="date"
      value={toDate}
     onChange={(e) => {
  setToDate(e.target.value);
  setCurrentPage(1);
}}
      className="border border-gray-300 rounded-lg px-4 py-2"
    />

  </div>

</div>

<div className="bg-white rounded-xl shadow-md p-4 mb-6">

  <h3 className="font-semibold mb-3">
    Minimum Amount
  </h3>

  <input
    type="number"
    placeholder="Enter Minimum Amount"
    value={minAmount}
    onChange={(e) => {
      setMinAmount(e.target.value);
      setCurrentPage(1);
    }}
    className="w-full border border-gray-300 rounded-lg px-4 py-2"
  />

</div>

<div className="bg-white rounded-xl shadow-md p-4 mb-6">

  <h3 className="font-semibold mb-3">
    Maximum Amount
  </h3>

  <input
    type="number"
    placeholder="Enter Maximum Amount"
    value={maxAmount}
    onChange={(e) => {
      setMaxAmount(e.target.value);
      setCurrentPage(1);
    }}
    className="w-full border border-gray-300 rounded-lg px-4 py-2"
  />

</div>

<div className="bg-white rounded-xl shadow-md p-4 mb-6">

  <h3 className="font-semibold mb-3">
    Transaction Type
  </h3>

  <select
    value={transactionType}
    onChange={(e) => {
      setTransactionType(
        e.target.value
      );
      setCurrentPage(1);
    }}
    className="w-full border border-gray-300 rounded-lg px-4 py-2"
  >
    <option value="all">
      All
    </option>

    <option value="debit">
      Debit
    </option>

    <option value="credit">
      Credit
    </option>

  </select>

</div>

<div className="bg-white rounded-xl shadow-md p-4 mb-6">
  <label className="block font-medium mb-2">
    Category
  </label>

  <select
    value={categoryFilter}
    onChange={(e) =>
      setCategoryFilter(
        e.target.value
      )
    }
    className="w-full border border-gray-300 rounded-lg px-4 py-2"
  >
    <option value="All">
      All Categories
    </option>

    <option value="Salary">
      Salary
    </option>

    <option value="Food">
      Food
    </option>

    <option value="Rent">
      Rent
    </option>

    <option value="Utility">
      Utility
    </option>

    <option value="ATM">
      ATM
    </option>

    <option value="Transfer">
      Transfer
    </option>

    <option value="Other">
      Other
    </option>
  </select>
</div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
  <label className="block font-semibold mb-2">
    Select Statement
  </label>

  <select
    value={selectedStatement}
   onChange={(e) => {
  setSelectedStatement(
    e.target.value
  );
  setCurrentPage(1);
}}
    className="w-full border border-gray-300 rounded-lg px-4 py-2"
  >
    <option value="">
      All Statements
    </option>

    {statements.map(
      (statement) => (
        <option
          key={statement.id}
          value={statement.id}
        >
          {statement.bank} -
          {" "}
          {statement.transactionCount}
          {" "}
          Transactions
        </option>
      )
    )}
  </select>
</div>
        <div className="mb-4">
  <select
    value={pageSize}
    onChange={(e) => {
      setPageSize(
        Number(e.target.value)
      );
      setCurrentPage(1);
    }}
    className="border px-3 py-2 rounded-lg"
  >
    <option value={10}>10</option>
    <option value={25}>25</option>
    <option value={50}>50</option>
    <option value={100}>100</option>
  </select>
</div>
        <div className="mb-6">
        <div className="mb-4 text-gray-600">
  Showing {paginatedTransactions.length}
  {" "}of{" "}
  {filteredTransactions.length}
  {" "}transactions
</div>

<div className="flex flex-wrap gap-2 mb-4">

 {searchTerm && (
  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2">

    Search: {searchTerm}

    <button
      onClick={() =>
        setSearchTerm("")
      }
    >
      ✕
    </button>

  </div>
)}

  {fromDate && (
    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
      From: {fromDate}
    </div>
  )}

  {toDate && (
    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
      To: {toDate}
    </div>
  )}

  {minAmount && (
    <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
      Min: ₹{minAmount}
    </div>
  )}

  {maxAmount && (
    <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
      Max: ₹{maxAmount}
    </div>
  )}

  {transactionType !== "all" && (
    <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
      Type: {transactionType}
    </div>
  )}

</div>

<button
  onClick={() => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
    setTransactionType("all");
    setSelectedStatement("");
    setCurrentPage(1);
  }}
  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-md mr-3"
>
  Reset Filters
</button>

  <button
    onClick={exportToExcel}
    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md"
  >
    Export Excel
  </button>
</div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">

          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">
              Transaction History
            </h2>
          </div>
          {error && (
  <div className="p-4 m-4 bg-red-100 text-red-700 rounded-lg">
    {error}
  </div>
)}
    {loading ? (
  <div className="p-6">
    {[...Array(5)].map((_, index) => (
      <div
        key={index}
        className="animate-pulse flex gap-4 border-b py-4"
      >
        <div className="h-4 bg-gray-300 rounded w-24"></div>

        <div className="h-4 bg-gray-300 rounded flex-1"></div>

        <div className="h-4 bg-gray-300 rounded w-20"></div>

        <div className="h-4 bg-gray-300 rounded w-20"></div>

        <div className="h-4 bg-gray-300 rounded w-24"></div>
      </div>
    ))}
  </div>
) : (
           <div className="overflow-x-auto max-h-[600px] overflow-y-auto">

              <table className="w-full">

              <thead className="sticky top-0 z-10 bg-blue-600">
                  <tr className="bg-blue-600 text-white">
                    <th className="px-4 py-3 text-left">
                      Date
                    </th>

                    <th className="px-4 py-3 text-left">
                      Description
                    </th>

                    <th className="px-4 py-3 text-right">
                      Debit
                    </th>

                    <th className="px-4 py-3 text-right">
                      Credit
                    </th>

                    <th className="px-4 py-3 text-right">
                      Balance
                    </th>
                  </tr>
                </thead>

                <tbody>

                 {paginatedTransactions.map(
                    (txn, index) => (
                      <tr
                        key={txn.id}
                        className={`border-b hover:bg-blue-50 transition ${
                          index % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          {txn.date}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {txn.description}
                        </td>

                        <td className="px-4 py-3 text-right text-red-600">
                          {txn.debit || "-"}
                        </td>

                        <td className="px-4 py-3 text-right text-green-600">
                          {txn.credit || "-"}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold">
                          ₹ {txn.balance}
                        </td>
                      </tr>
                    )
                  )}

                </tbody>

              </table>

             {filteredTransactions.length === 0 && !loading && (
  <div className="p-10 text-center">
    <div className="text-6xl mb-4">
      📄
    </div>

    <h3 className="text-2xl font-semibold text-gray-700">
      No Transactions Found
    </h3>

    <p className="text-gray-500 mt-2">
      Try changing your search term or upload a bank statement.
    </p>
  </div>
)}

              <div className="flex justify-center items-center gap-4 p-6">

  <button
    disabled={currentPage === 1}
    onClick={() =>
      setCurrentPage(
        currentPage - 1
      )
    }
    className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Prev
  </button>

  <span>
    Page {currentPage} of {totalPages}
  </span>

  <button 
   disabled={
  currentPage >= totalPages ||
  totalPages === 0
}
    onClick={() =>
      setCurrentPage(
        currentPage + 1
      )
    }
    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Next
  </button>

</div>

            </div>
          )}
        </div>

      </div>
    </div>
    </>
  );
} 