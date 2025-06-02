import { Knock } from "@knocklabs/node";
import { knocklabsEnv } from "@repo/env/knocklabs";
const key = knocklabsEnv().KNOCK_SECRET_API_KEY;

export const notifications = new Knock(key);
