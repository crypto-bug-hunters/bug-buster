import { MantineThemeOverride, createTheme } from "@mantine/core";
import { generateColors } from "@mantine/colors-generator";

export const theme: MantineThemeOverride = createTheme({
  fontFamily: "Open Sans, sans-serif",
  primaryColor: "cartesi-cyan",
  colors: {
    "cartesi-cyan": generateColors("#00f6ff"),
  },
});
