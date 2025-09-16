import os from "os";
import app from "./app";
import { checkCloudinaryConnection } from "./config/cloudinary";
import connectDB from "./config/db";
require("dotenv").config();

const PORT = Number(process.env.PORT || 5000);

//DB Connection
connectDB();

//cloudinary config
checkCloudinaryConnection();

const networkInterfaces = os.networkInterfaces();
let localIP = "127.0.0.1";

for (const ifaceList of Object.values(networkInterfaces)) {
  if (!ifaceList) continue;
  for (const iface of ifaceList) {
    if (iface.family === "IPv4" && !iface.internal) {
      localIP = iface.address;
      break;
    }
  }
  if (localIP !== "127.0.0.1") break;
}

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`📌 Server running`);
  console.log(`   - Localhost: http://localhost:${PORT}`);
  console.log(`   - Network:   http://${localIP}:${PORT}`);
  console.log("===========================================");
});
