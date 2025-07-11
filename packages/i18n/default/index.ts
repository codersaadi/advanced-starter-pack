import auth from './auth';
import blog from './blog';
import changelog from './changelog';
import clerk from './clerk';
import common from './common';
import error from './error';
import oauth from './oauth';
import session from './session';
import signin from './signin';
import welcome from './welcome';
const resources = {
  auth,
  changelog,
  clerk,
  error,
  oauth,
  welcome,
  signin,
  common,
  blog,
  session,
} as const;

export default resources;

export const defaultNameSpaces = Object.entries(resources).map(
  ([key]) => key as keyof typeof resources
);
export type DefaultNS = (typeof defaultNameSpaces)[number];
export type Resources = typeof resources;
