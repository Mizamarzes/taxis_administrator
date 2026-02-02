import { Outlet } from 'react-router-dom';
import { AppSideBar } from './AppSideBar';
import { Header } from './Header';
import { Page, PageHeader } from './Page';
import { SidebarInset, SidebarProvider } from './ui/sidebar';

export const Layout = () => {
  return (
    <SidebarProvider open={false}>
      <AppSideBar />
      <SidebarInset>
        <Header />

        <main>
          <Page>
            <PageHeader />

            <div className="flex-1">
              <Outlet />
            </div>
          </Page>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
