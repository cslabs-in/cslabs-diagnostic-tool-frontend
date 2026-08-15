import { AppRouter } from "./app/router";
import { ThemeProvider } from "./app/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}