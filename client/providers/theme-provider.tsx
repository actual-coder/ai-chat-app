import { COLORS } from "@/constants/theme";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "AI-CHAT-THEME";

type Theme = "dark" | "light";

interface ThemeContextInterface {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  colors: (typeof COLORS)["dark"] | (typeof COLORS)["light"];
}

const ThemeContext = createContext<ThemeContextInterface | undefined>(
  undefined,
);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [isLoaded, setIsLoaded] = useState(false);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const colors = COLORS[theme];

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedTheme === "light" || savedTheme === "dark") {
          setTheme(savedTheme);
        }
      } catch {
        console.log("Failed to load theme");
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, theme);
    }
  }, [isLoaded, theme]);

  return (
    <ThemeContext.Provider value={{ colors, theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
