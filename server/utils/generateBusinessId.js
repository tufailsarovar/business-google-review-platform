import crypto from "crypto";

const generateBusinessId = (businessName = "") => {
  const name = String(businessName)
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "");

  const businessNamePart =
    name || "business";

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const randomBytes = crypto.randomBytes(6);

  let uniqueCode = "";

  for (let i = 0; i < 6; i++) {
    uniqueCode +=
      characters[randomBytes[i] % characters.length];
  }

  return `${businessNamePart}-${uniqueCode}`;
};

export default generateBusinessId;