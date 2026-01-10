"use client";

import { LayoutDashboardIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const components = [
  "Accordion",
  "Alert",
  "Alert Dialog",
  "Aspect Ratio",
  "Avatar",
  "Badge",
  "Breadcrumb",
  "Button",
  "Button Group",
  "Calendar",
  "Card",
  "Carousel",
  "Chart",
  "Checkbox",
  "Collapsible",
  "Combobox",
  "Command",
  "Context Menu",
  "Dialog",
  "Drawer",
  "Dropdown Menu",
  "Empty",
  "Field",
  "Form",
  "Hover Card",
  "Input",
  "Input Group",
  "Input OTP",
  "Item",
  "Kbd",
  "Label",
  "Menubar",
  "Native Select",
  "Navigation Menu",
  "Pagination",
  "Popover",
  "Progress",
  "Radio Group",
  "Resizable",
  "Scroll Area",
  "Select",
  "Separator",
  "Sheet",
  "Sidebar",
  "Skeleton",
  "Slider",
  "Sonner",
  "Spinner",
  "Switch",
  "Table",
  "Tabs",
  "Textarea",
  "Toggle",
  "Toggle Group",
  "Tooltip",
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname.slice(1) || "";

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border py-3">
        <SidebarMenuButton asChild isActive={currentPath === ""}>
          <Link to="/">
            <LayoutDashboardIcon className="size-4" />
            <span>Overview</span>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="no-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel>Components</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {components.map((name) => {
                const id = name.toLowerCase().replace(/\s+/g, "-");
                return (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton asChild isActive={currentPath === id}>
                      <Link to={`/${id}`}>
                        <span>{name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
