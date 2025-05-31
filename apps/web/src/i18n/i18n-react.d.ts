import type React from "react";
// Extend React's types to accept ReactI18NextChildren
declare module "react" {
  type ReactI18NextChildren = React.ReactNode;
}
