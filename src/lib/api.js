import { supabase } from './supabase';

/**
 * Fetches transactions for a specific user
 * @param {string} userId - The ID of the user whose transactions to fetch
 * @returns {Promise<Array>} Array of transactions
 * @throws {Error} If there's an error fetching the transactions
 */
export async function getTransactions(userId) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Fetches a single transaction by ID
 * @param {string} transactionId - The ID of the transaction to fetch
 * @returns {Promise<Object>} The transaction object
 * @throws {Error} If there's an error fetching the transaction
 */
export async function getTransactionById(transactionId) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
}

/**
 * Inserts a new transaction into the database
 * @param {Object} transaction - The transaction object to insert
 * @param {string} userId - The ID of the user creating the transaction
 * @returns {Promise<Object>} The inserted transaction
 * @throws {Error} If there's an error inserting the transaction
 */
export async function insertTransaction(transaction, userId) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          ...transaction,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error inserting transaction:', error);
    throw error;
  }
}

/**
 * Updates an existing transaction in the database
 * @param {string} transactionId - The ID of the transaction to update
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object>} The updated transaction
 * @throws {Error} If there's an error updating the transaction
 */
export async function updateTransaction(transactionId, updates) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
}

/**
 * Deletes a transaction from the database
 * @param {string} transactionId - The ID of the transaction to delete
 * @returns {Promise<void>}
 * @throws {Error} If there's an error deleting the transaction
 */
export async function deleteTransaction(transactionId) {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
} 