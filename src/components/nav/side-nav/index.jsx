/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
'use client';
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Home, Settings, BookOpen, CreditCard, CircleDollarSign, FileText, GraduationCap, LogOut, User, UserPlus, Users, ChevronDown, ChevronUp, } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/contexts/DashboardContext";
import { InlineLoader } from "@/components/ui/loader"; // Updated import
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAllRoles } from "@/services/roles";
import { useLoading } from "./components/LoadingContext";
const navigationItems = [
    { name: "Dashboard", icon: Home, href: "/" },
    { name: "Profile", icon: User, href: "/profile" },
    {
        name: "Registration",
        icon: UserPlus,
        href: "/registration",
        children: [
            { name: "New Registration", href: "/registration/new", icon: UserPlus },
            { name: "Manage Applicant", href: "/registration/manage", icon: Users },
        ],
    },
    {
        name: "Entrance Exams",
        icon: BookOpen,
        href: "/exams",
        children: [
            { name: "Placement", href: "/exams/results", icon: BookOpen },
            { name: "Admitted Applicants", href: "/exams/shortlisted", icon: BookOpen },
        ],
    },
    {
        name: "Enrollment",
        icon: GraduationCap,
        href: "/admission",
    },
    {
        name: "Fee Management",
        icon: CreditCard,
        href: "/fees",
        children: [
            { name: "Create Receipt", href: "/fees/invoices", icon: CircleDollarSign },
            { name: "Receipt History", href: "/fees/receipt-history", icon: CreditCard },
            { name: "Payment History", href: "/fees/payment-history", icon: FileText },
        ],
    },
    {
        name: "Admin",
        icon: Settings,
        href: "/admin",
        children: [
            { name: "Overview", href: "/admin", icon: Settings },
            { name: "User Management", href: "/admin/user-management", icon: Settings },
            { name: "Class & School Settings", href: "/admin/classes", icon: Settings },
            { name: "System Settings", href: "/admin/system-settings", icon: Settings },
            // { name: "Module Access", href: "/admin/module-access", icon: Settings },
            // { name: "Roles & Permissions", href: "/admin/roles", icon: Settings },
        ],
    },
    { name: "Logout", icon: LogOut, href: "/logout" },
];
// Add default badge false
navigationItems.forEach((item) => {
    var _a;
    if (!item.badge)
        item.badge = false;
    (_a = item.children) === null || _a === void 0 ? void 0 : _a.forEach((child) => {
        if (!child.badge)
            child.badge = false;
    });
});
export default function SideNav() {
    const [isOpen, setIsOpen] = useState(true);
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [loadingItem, setLoadingItem] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const { user, logout } = useAuth();
    const { activeItem, setActiveItem } = useDashboard();
    const { startNavigation, navigationLoading } = useLoading();
    const router = useRouter();
    useEffect(() => {
        setProfileImage((user === null || user === void 0 ? void 0 : user.id) ? `/api/users/${user.id}/profile-image` : "/images/default-user.png");
    }, [user === null || user === void 0 ? void 0 : user.id]);
    const [filteredNavItems, setFilteredNavItems] = useState([]);
    const filterNavItemsByRole = (role, items) => {
        const map = {
            admin: items,
            frontdesk: items
                .filter(item => ['Dashboard', 'Profile', 'Registration', 'Entrance Exams', 'Enrollment'].includes(item.name))
                .map(item => {
                var _a;
                if (item.name === 'Entrance Exams') {
                    return Object.assign(Object.assign({}, item), { children: (_a = item.children) === null || _a === void 0 ? void 0 : _a.filter(child => child.name === 'Placement') });
                }
                return item;
            }),
            accountant: items.filter(item => ['Dashboard', 'Fee Management', 'Profile', 'Enrollment'].includes(item.name)),
            teacher: items.filter(item => ['Dashboard', 'Enrollment', 'Profile'].includes(item.name)),
        };
        return map[role] || [];
    };
    useEffect(() => {
        const fetchRolesAndFilter = async () => {
            var _a;
            if (!(user === null || user === void 0 ? void 0 : user.role_id))
                return;
            try {
                const roles = await getAllRoles();
                const userRole = Object.assign({}, roles.find(role => Number(role.id) === user.role_id));
                const roleName = ((_a = userRole === null || userRole === void 0 ? void 0 : userRole.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
                const allowedItems = filterNavItemsByRole(roleName, navigationItems);
                setFilteredNavItems(allowedItems);
            }
            catch (error) {
                console.error("Failed to fetch roles:", error);
            }
        };
        fetchRolesAndFilter();
    }, [user === null || user === void 0 ? void 0 : user.role_id]);
    const toggleSubMenu = (name) => {
        setExpandedMenu(expandedMenu === name ? null : name);
    };
    const handleNavClick = async (item, e) => {
        e === null || e === void 0 ? void 0 : e.preventDefault();
        if (item.children) {
            toggleSubMenu(item.name);
            return;
        }
        setLoadingItem(item.name);
        try {
            if (item.name === "Logout") {
                startNavigation("/login");
                await logout();
                router.push("/login");
            }
            else {
                startNavigation(item.href);
                router.push(item.href);
                setActiveItem(item.name);
                setExpandedMenu(null);
            }
        }
        catch (error) {
            console.error("Navigation error:", error);
            setLoadingItem(null);
        }
    };
    const handleSubNavClick = async (sub, e) => {
        e.preventDefault();
        setLoadingItem(sub.name);
        try {
            startNavigation(sub.href);
            router.push(sub.href);
            setActiveItem(sub.name);
        }
        catch (error) {
            console.error("Navigation error:", error);
            setLoadingItem(null);
        }
    };
    // Clear loading item when navigation completes
    useEffect(() => {
        if (!navigationLoading && loadingItem) {
            const timer = setTimeout(() => {
                setLoadingItem(null);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [navigationLoading, loadingItem]);
    return (<aside className={`relative flex h-full flex-col border-r bg-white shadow-lg transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${isOpen ? "w-64" : "w-20"}`}>
      {/* Toggle Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="absolute -right-3 top-12 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors duration-200">
        {isOpen ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
      </button>

      {/* Logo */}
      <div className="flex h-16 items-center px-4">
      {isOpen && <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">{user === null || user === void 0 ? void 0 : user.full_name}: 3GEC00{user === null || user === void 0 ? void 0 : user.id}</span>}
      </div>

      {/* Menu Items */}
      <nav className="mt-2 flex-1 space-y-1 px-2">
        {filteredNavItems.map((item) => (<div key={item.name} title={!isOpen ? item.name : ''}>
            <Link href={item.href} onClick={(e) => handleNavClick(item, e)} className={`group flex items-center rounded-md px-2 py-3 text-sm font-medium transition-all duration-200 ${activeItem === item.name && !item.children
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"} ${!isOpen && !item.children ? "justify-center" : ""} ${loadingItem === item.name ? "opacity-75 cursor-wait" : ""}`}>
              <div className="relative flex items-center justify-center">
                {loadingItem === item.name ? (<InlineLoader size="sm" color="indigo"/>) : (<>
                    <item.icon size={20}/>
                    {item.badge && (<span className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                        {item.badge}
                      </span>)}
                  </>)}
              </div>
              {isOpen && <span className="ml-3 flex-1">{item.name}</span>}
              {item.children && isOpen && (<span className="ml-auto">
                  {expandedMenu === item.name ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </span>)}
            </Link>

            {/* Submenu */}
            <AnimatePresence>
              {item.children && expandedMenu === item.name && isOpen && (<motion.div className="ml-6 space-y-1" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                  {item.children.map((sub) => (<Link key={sub.name} href={sub.href} onClick={(e) => handleSubNavClick(sub, e)} className={`flex items-center rounded-md px-4 py-2 text-sm transition-all duration-200 ${activeItem === sub.name
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"} ${loadingItem === sub.name ? "opacity-75 cursor-wait" : ""}`}>
                      {loadingItem === sub.name ? (<InlineLoader size="xs" color="indigo" className="mr-2"/>) : (<sub.icon size={18} className="mr-2"/>)}
                      {sub.name}
                    </Link>))}
                </motion.div>)}
            </AnimatePresence>
          </div>))}
      </nav>
    </aside>);
}
