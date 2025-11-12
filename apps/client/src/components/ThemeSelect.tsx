"use client";
import { useTheme } from "next-themes";
import { StyledDropdown } from "./UI/StyledDropdown";

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  return (
    <StyledDropdown value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </StyledDropdown>
  );
}
