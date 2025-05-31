import auth from "./auth";
import changelog from "./changelog";
import clerk from "./clerk";
import error from "./error";
import oauth from "./oauth";
import signin from "./signin";
import welcome from "./welcome";
const resources = {
  auth,
  changelog,
  clerk,
  error,
  oauth,
  welcome,
  signin,
} as const;

export default resources;

export const defaultNameSpaces = Object.entries(resources).map(([key]) => key);
