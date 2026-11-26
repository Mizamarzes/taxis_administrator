import { useColorScheme } from "react-native"
import { darkPalette, lightPalette, type Palette } from "./colors"

export function useTheme(): Palette {
  const scheme = useColorScheme()
  return scheme === "light" ? lightPalette : darkPalette
}
