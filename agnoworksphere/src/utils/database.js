// src/utils/database.js

// PostgreSQL database connection utility
// This is a mock implementation for frontend development
// In a real application, database operations would be handled by a backend API

const mockDatabase = {
  // Mock database operations
  query: async (sql, params = []) => {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Mock responses based on query type
    if (sql.includes('SELECT')) {
      return { rows: [], rowCount: 0 };
    } else if (sql.includes('INSERT')) {
      return { rows: [{ id: Date.now() }], rowCount: 1 };
    } else if (sql.includes('UPDATE')) {
      return { rows: [], rowCount: 1 };
    } else if (sql.includes('DELETE')) {
      return { rows: [], rowCount: 1 };
    }

    return { rows: [], rowCount: 0 };
  },

  // Helper methods for common operations
  select: async (table, conditions = {}, columns = '*') => {
    const result = await mockDatabase.query(`SELECT ${columns} FROM ${table}`);
    return result.rows;
  },

  insert: async (table, data) => {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const result = await mockDatabase.query(
      `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  },

  update: async (table, data, conditions) => {
    const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = Object.values(data);

    const result = await mockDatabase.query(
      `UPDATE ${table} SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, conditions.id]
    );
    return result.rows[0];
  },

  delete: async (table, conditions) => {
    const result = await mockDatabase.query(
      `DELETE FROM ${table} WHERE id = $1`,
      [conditions.id]
    );
    return result.rowCount > 0;
  }
};

export default mockDatabase;
