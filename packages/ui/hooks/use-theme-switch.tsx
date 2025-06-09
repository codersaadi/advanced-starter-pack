"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect } from "react";

export const useThemeSwitch = () => {
  const DARK_THEME = "dark";
  const LIGHT_THEME = "light";
  const [mounted, setMounted] = React.useState(false);
  const theme = useTheme();
  useEffect(() => setMounted(true), []);
  const getThemeIconButton = (icon?: "dark" | "light") => {
    if (theme.resolvedTheme === DARK_THEME || icon === "dark") {
      <SunIcon
        className="h-5 w-5 "
        onClick={() => theme.setTheme(LIGHT_THEME)}
      />;
    }
    if (theme.resolvedTheme === LIGHT_THEME || icon === "light") {
      return (
        <MoonIcon
          className="h-5 w-5 rounded-md"
          onClick={() => theme.setTheme(DARK_THEME)}
        />
      );
    }
  };
  return {
    DARK_THEME,
    LIGHT_THEME,
    mounted,
    setMounted,
    ...theme,
    getThemeIconButton
  };
};
