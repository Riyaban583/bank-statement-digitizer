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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statements, setStatements] = useState([]);
const [selectedStatement, setSelectedStatement] = useState("");
  const [searchParams] =
  useSearchParams();

const statementId =
  searchParams.get(
    "statementId"
  );

 useEffect(() => {
  fetchTransactions();
  fetchStatements();
}, []);

  const fetchTransactions = async () => {
  try {

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

    return (
      matchesSearch &&
      matchesStatement
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
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
  <label className="block font-semibold mb-2">
    Select Statement
  </label>

  <select
    value={selectedStatement}
    onChange={(e) =>
      setSelectedStatement(
        e.target.value
      )
    }
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