import { AppSideBar } from "./components/AppSideBar";
import { Header } from "./components/Header";
import { Page, PageHeader } from "./components/Page";
import { ThemeProvider } from "./components/ThemeProvider";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
// import AppRouter from "./routes/AppRouter";

const App = () => {
  return (
    <ThemeProvider defaultTheme='dark'>
        <SidebarProvider open={false}>
            <AppSideBar />
            <SidebarInset>
                <Header />

                <main>
                    <Page>
                        <PageHeader />

                        <div className="">
                            <DashBoardCard>
                                
                            </DashBoardCard>
                        </div>
                    </Page>
                </main>
            </SidebarInset>
        </SidebarProvider>
    </ThemeProvider>
  );
};

export default App;
