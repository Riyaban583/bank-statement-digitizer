import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../firebase/firebaseConfig";

import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Statements() {
  const [statements, setStatements] =
    useState([]);

  useEffect(() => {
    fetchStatements();
  }, []);

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

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Statements Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Total Statements:
              <span className="font-semibold text-blue-600 ml-2">
                {statements.length}
              </span>
            </p>
          </div>

          {/* Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-5">
              <h3 className="text-gray-500 text-sm">
                Total Statements
              </h3>

              <p className="text-3xl font-bold text-blue-600 mt-2">
                {statements.length}
              </p>
            </div>
          </div>

          {/* Statements Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">

            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">
                Uploaded Statements
              </h2>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-4 py-3 text-left">
                      Bank
                    </th>

                    <th className="px-4 py-3 text-center">
                      Transactions
                    </th>

                    <th className="px-4 py-3 text-center">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {statements.map(
                    (
                      statement,
                      index
                    ) => (
                      <tr
                        key={
                          statement.id
                        }
                        className={`border-b hover:bg-blue-50 transition ${
                          index % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3 font-medium">
                          {
                            statement.bank
                          }
                        </td>

                        <td className="px-4 py-3 text-center">
                          {
                            statement.transactionCount
                          }
                        </td>

                        <td className="px-4 py-3 text-center">
                          <Link
                            to={`/transactions?statementId=${statement.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  )}

                </tbody>

              </table>

              {statements.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No Statements Found
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </>
  );
}