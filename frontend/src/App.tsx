import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import AppRouter from "./routes/AppRouter";

const App = () => {
  return (
    <ThemeProvider defaultTheme='dark'>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
