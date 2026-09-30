const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const saleRoutes = require("./routes/saleRoutes");
const customerRoutes = require("./routes/customerRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reminderRoutes = require("./routes/reminderRoutes");

dotenv.config();

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reminders", reminderRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Inventory Backend API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

