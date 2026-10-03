const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const protect = require("./middleware/authMiddleware");

const productRoutes = require("./routes/productRoutes");
const saleRoutes = require("./routes/saleRoutes");
const customerRoutes = require("./routes/customerRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const taskRoutes = require("./routes/taskRoutes");
const voiceRoutes = require("./routes/voiceRoutes");

dotenv.config();

const app = express();

connectDB();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://localhost",
  "http://localhost",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);


app.use(
  "/api/products",
  protect,
  productRoutes
);

app.use(
  "/api/sales",
  protect,
  saleRoutes
);

app.use(
  "/api/customers",
  protect,
  customerRoutes
);

app.use(
  "/api/purchases",
  protect,
  purchaseRoutes
);

app.use(
  "/api/purchase-orders",
  protect,
  purchaseOrderRoutes
);

app.use(
  "/api/dashboard",
  protect,
  dashboardRoutes
);

app.use(
  "/api/reminders",
  protect,
  reminderRoutes
);

app.use("/api/payments", protect, paymentRoutes);
app.use("/api/tasks", protect, taskRoutes);
app.use("/api/voice", protect, voiceRoutes);

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