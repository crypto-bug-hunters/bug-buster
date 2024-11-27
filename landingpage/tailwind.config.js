/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
      },
    },
    extend: {
      // RADIX UI - do not modify
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      // END RADIX UI

      // Custom

      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Plus Jakarta Sans", "sans-serif"],
      },
      fontWeight: {
        normal: 300,
        medium: 500,
        bold: 600,
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        h5: "var(--fs5)",
        h4: "var(--fs4)",
        h3: "var(--fs3)",
        h2: "var(--fs2)",
        h1: "var(--fs1)",
      },
      spacing: {
        headerDesktop: "var(--header-desktop-height)",
        headerDesktopInfobar: "var(--header-desktop-infobar-height)",
        headerMobile: "var(--header-mobile-height)",
        headerMobileInfobar: "var(--header-mobile-infobar-height)",
        section: "var(--section-spacing)",
      },
      height: {
        headerDesktop: "var(--header-desktop-height)",
        headerDesktopInfobar: "var(--header-desktop-infobar-height)",
        headerMobile: "var(--header-mobile-height)",
        headerMobileInfobar: "var(--header-mobile-infobar-height)",
      },
      minHeight: {
        headerDesktop: "var(--header-desktop-height)",
        headerDesktopInfobar: "var(--header-desktop-infobar-height)",
        headerMobile: "var(--header-mobile-height)",
        headerMobileInfobar: "var(--header-mobile-infobar-height)",
      },

      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": "hsl(var(--muted-foreground))",
            "--tw-prose-headings": "hsl(var(--foreground))",
            "--tw-prose-lead": "hsl(var(--foreground))",
            "--tw-prose-links": "hsl(var(--tertiary))",
            "--tw-prose-hr": "hsl(var(--border))",
            "--tw-prose-th-borders": "hsl(var(--border))",
            "--tw-prose-td-borders": "hsl(var(--border))",
            fontWeight: theme("fontWeight.light"),
            a: {
              textDecoration: "none",
            },
            "a:hover": {
              textDecoration: "none",
            },
            h1: {
              fontWeight: theme("fontWeight.medium"),
              fontSize: "var(--fs1)",
              marginBottom: ".75em",
              lineHeight: "110%",
            },
            h2: {
              fontWeight: theme("fontWeight.medium"),
              fontSize: "var(--fs2)",
              marginBottom: ".75em",
              lineHeight: "110%",
            },
            h3: {
              fontWeight: theme("fontWeight.medium"),
              fontSize: "var(--fs3)",
              lineHeight: "110%",
            },
            h4: {
              fontWeight: theme("fontWeight.medium"),
              fontSize: "var(--fs4)",
              lineHeight: "110%",
            },
            h5: {
              fontWeight: theme("fontWeight.bold"),
              fontSize: "var(--fs5)",
              marginBottom: "1em",
              color: "hsl(var(--foreground))",
            },
            h6: {
              fontWeight: theme("fontWeight.bold"),
              fontSize: "1rem",
              marginBottom: "1em",
              color: "hsl(var(--foreground))",
            },
            p: {
              lineHeight: "140%",
            },
            "figure figcaption": {
              textAlign: "center",
              fontSize: "0.75rem",
              marginTop: "0.5em",
            },
            img: {
              borderRadius: theme("borderRadius.2xl"),
            },
            cite: {
              fontStyle: "normal",
              borderLeftWidth: "1px",
              borderLeftColor: "hsl(var(--accent))",
              borderLeftStyle: "solid",
              paddingLeft: "1.5rem",
              display: "block",
            },
          },
          invert: {
            css: {
              "--tw-prose-body": "hsl(var(--muted-foreground))",
              "--tw-prose-headings": "hsl(var(--foreground))",
              "--tw-prose-lead": "hsl(var(--foreground))",
              "--tw-prose-links": "var(--tw-prose-links)",
              "--tw-prose-hr": "hsl(var(--border))",
              "--tw-prose-th-borders": "hsl(var(--border))",
              "--tw-prose-td-borders": "hsl(var(--border))",
            },
          },
        },
      }),
    },
  },
  // eslint-disable-next-line no-undef
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
};
