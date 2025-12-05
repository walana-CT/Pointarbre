import bcrypt from 'bcrypt'

const storedHash = "$2b$10$XA1aDFcK97vP62RmhafBl.lOxp7cKwZldqM0ztmlnnH2PZMT0Ifge";
const password = "admin123";

try {
  const isValid = await bcrypt.compare(password, storedHash);
  console.log("Password verification result:", isValid);
} catch (err) {
  console.error("Error verifying password:", err);
}
