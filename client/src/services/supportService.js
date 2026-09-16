import api from "./api";

export const contactAdmin = data =>
  api.post("/support/contact", data);