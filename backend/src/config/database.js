const mongoose = require('mongoose');

/* =========================
   DATABASE CONNECTION
========================= */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      
    });
    // console.log(conn.connection);  
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error mongo: ${error.message}`);
    process.exit(1);
  }
};

/* ======================================================
   EXPORTS
====================================================== */
module.exports = connectDB;