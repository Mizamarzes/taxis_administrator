import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "./ui/sidebar";


export const AppSideBar = () => {

    const { isMobile } = useSidebar();



    return (
        <Sidebar
            variant="floating"
            collapsible="icon"
        >
            {/* SideBar Header */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Sidebar Content */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    Dashboard
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    Settings
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}