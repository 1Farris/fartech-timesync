const express = require("express");
const User = require("../models/User");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

/* ================= GET USERS BY ROLE ================= */
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { role } = req.query;

    const filter = role ? { role } : {};

    const users = await User.find(filter).select(
      "firstName lastName email role"
    );

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;