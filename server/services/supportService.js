import {sendMail} from "./emailService.js";import {env} from "../config/env.js";export const sendSupport=x=>sendMail({to:env.adminEmail,subject:`TapReview Support: ${x.subject}`,text:`Name: ${x.name}
Email: ${x.email}

${x.message}`});
