import {
  collection,
  addDoc,
  serverTimestamp,
  writeBatch,
  doc,
} from "firebase/firestore";

import CryptoJS from "crypto-js";

import { db } from "../firebase/firebaseConfig";

export const createStatement = async ({
  bank,
  userId,
  transactionCount,
}) => {
  try {
    const docRef = await addDoc(
      collection(db, "statements"),
      {
        bank,
        userId,
        transactionCount,
        uploadedAt:
          serverTimestamp(),
      }
    );

    return docRef.id;
  } catch (error) {
    console.error(
      "Error creating statement:",
      error
    );

    throw error;
  }
};

const generateTransactionId = (
  transaction
) => {
  const rawString = `${transaction.date}-${transaction.description}-${transaction.amount}`;

  return CryptoJS.SHA256(
    rawString
  ).toString();
};

const getCategory = (
  description
) => {
  const desc =
    description.toLowerCase();

  if (
    desc.includes("salary")
  )
    return "Salary";

  if (
    desc.includes("swiggy") ||
    desc.includes("zomato") ||
    desc.includes("food")
  )
    return "Food";

  if (
    desc.includes("rent")
  )
    return "Rent";

  if (
    desc.includes(
      "electricity"
    ) ||
    desc.includes("water") ||
    desc.includes("gas")
  )
    return "Utility";

  if (
    desc.includes("atm")
  )
    return "ATM";

  if (
    desc.includes("upi") ||
    desc.includes(
      "transfer"
    )
  )
    return "Transfer";

  return "Other";
};

export const saveTransactionsBatch =
  async (
    transactions,
    statementId,
    userId
  ) => {
    try {
      const batchSize = 500;

      for (
        let i = 0;
        i < transactions.length;
        i += batchSize
      ) {
        const batch =
          writeBatch(db);

        const chunk =
          transactions.slice(
            i,
            i + batchSize
          );

        chunk.forEach(
          (transaction) => {
            const transactionId =
              generateTransactionId(
                transaction
              );

            const transactionRef =
              doc(
                db,
                "transactions",
                transactionId
              );

           batch.set(
  transactionRef,
  {
    ...transaction,

    category:
      getCategory(
        transaction.description
      ),

    statementId,
    userId,
  }
);
          }
        );

        await batch.commit();
      }

      console.log(
        "Transactions saved successfully"
      );
    } catch (error) {
      console.error(
        "Error saving transactions:",
        error
      );

      throw error;
    }
  };