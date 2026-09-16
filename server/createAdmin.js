import "dotenv/config";
import bcrypt from "bcryptjs";

import connectDB from "./config/db.js";
import Admin from "./models/Admin.js";

const createAdmin = async () => {
  try {
    await connectDB();

    const email = String(
      process.env.ADMIN_EMAIL || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      process.env.ADMIN_PASSWORD || ""
    );

    if (!email || !password) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD are required in server/.env"
      );
    }

    if (password.length < 8) {
      throw new Error(
        "ADMIN_PASSWORD must be at least 8 characters."
      );
    }

    const existingAdmin = await Admin.findOne({
      email,
    });

    if (existingAdmin) {
      existingAdmin.name = "Super Admin";
      existingAdmin.password =
        await bcrypt.hash(password, 12);
      existingAdmin.role = "admin";
      existingAdmin.isActive = true;

      await existingAdmin.save();

      console.log(
        `Admin account updated: ${email}`
      );
    } else {
      const hashedPassword =
        await bcrypt.hash(password, 12);

      await Admin.create({
        name: "Super Admin",
        email,
        password: hashedPassword,
        role: "admin",
        isActive: true,
      });

      console.log(
        `Admin account created: ${email}`
      );
    }

    process.exit(0);
  } catch (error) {
    console.error(
      "Admin creation failed:",
      error.message
    );

    process.exit(1);
  }
};

createAdmin();