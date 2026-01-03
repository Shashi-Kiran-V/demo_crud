const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection
const pool = new Pool({
  user: "your_pg_user",
  host: "localhost",
  database: "employee_db",
  password: "your_pg_password",
  port: 5432,
});

// Create table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS employees (
    empid SERIAL PRIMARY KEY,
    empname VARCHAR(50) NOT NULL,
    empage INT NOT NULL
  );
`);

// Routes

// GET all employees
app.get("/employees", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees ORDER BY empid");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE employee
app.post("/employees", async (req, res) => {
  const { empname, empage } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO employees (empname, empage) VALUES ($1, $2) RETURNING *",
      [empname, empage]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE employee
app.put("/employees/:id", async (req, res) => {
  const { id } = req.params;
  const { empname, empage } = req.body;
  try {
    const result = await pool.query(
      "UPDATE employees SET empname=$1, empage=$2 WHERE empid=$3 RETURNING *",
      [empname, empage, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE employee
app.delete("/employees/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM employees WHERE empid=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
