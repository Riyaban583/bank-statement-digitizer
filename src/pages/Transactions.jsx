import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "transactions")
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
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((txn) =>
    txn.description
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">

          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">
              Transaction History
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              Loading Transactions...
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
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

                  {filteredTransactions.map(
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

              {filteredTransactions.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No Transactions Found
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
} 