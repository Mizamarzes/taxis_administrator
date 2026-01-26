import { AppSideBar } from "./components/AppSideBar";
import { ThemeProvider } from "./components/ThemeProvider";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import AppRouter from "./routes/AppRouter";

const App = () => {
  return (
    <ThemeProvider defaultTheme='dark'>
        <SidebarProvider open={false}>
            <AppSideBar />
            <SidebarInset></SidebarInset>
        </SidebarProvider>
    </ThemeProvider>
  );
};

export default App;
