import { getEmailEnv } from "@repo/env/email";
import { Resend } from "resend";
export const resend = new Resend(getEmailEnv().RESEND_KEY);
