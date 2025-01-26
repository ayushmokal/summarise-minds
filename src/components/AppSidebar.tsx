import { Globe2, Languages, Home } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"

const items = [
  {
    title: "Home",
    url: "/location",
    icon: Home,
  },
  {
    title: "Location",
    url: "/location",
    icon: Globe2,
  },
  {
    title: "Language",
    url: "/language",
    icon: Languages,
  },
  {
    title: "News Preferences",
    url: "/preferences",
    icon: Globe2,
  },
]

export function AppSidebar() {
  const navigate = useNavigate();

  return (
    <>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <div className="flex items-center justify-between px-4 py-2">
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarTrigger />
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => navigate(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  )
}