// components/nav/SideNav.tsx
/* eslint-disable @typescript-eslint/consistent-type-imports */
'use client'
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Home, Settings, Search, BookOpen, CreditCard, GraduationCap, LogOut, User, UserPlus, LucideProps, Users, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import { useAuth } from "@/hooks/useAuth"; // Import your useAuth hook
import { useDashboard } from "@/contexts/DashboardContext";

// Dashboard items with icons
interface NavItem {
  badge?: string | false; // badge is optional
  name: string;
  icon: React.ComponentType<LucideProps>;
  href: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  { name: "Dashboard", icon: Home, href: '/' },
  { name: "Profile", icon: User, href: '/profile' },
  {
    name: "Registration",
    icon: UserPlus,
    href: '/registration',
    children: [
      { name: "New Registration", href: '/registration/new', icon: UserPlus }, // Added icon
      { name: "Manage Applicant", href: '/registration/manage', icon: Users }, // Added icon
    ],
  },
  {
    name: "Entrance Exams",
    icon: BookOpen,
    href: '/exams',
    children: [
      { name: "View Results", href: '/exams/results', icon: BookOpen }, // Added icon
      { name: "Recordings", href: '/exams/recordings', icon: BookOpen }, // Added icon
      { name: "Shortlisted", href: '/exams/shortlisted', icon: BookOpen }, // Added icon
    ],
  },
  {
    name: "Admissions",
    icon: GraduationCap,
    href: '/admissions',
    children: [
      { name: "Process Admission", href: '/admissions/process', icon: GraduationCap }, // Added icon
      { name: "Enrolled Students", href: '/admissions/enrolled', icon: GraduationCap }, // Added icon
    ],
  },
  {
    name: "Fee Management",
    icon: CreditCard,
    href: '/fees',
    children: [
      { name: "Record Payments", href: '/fees/record-payment', icon: CreditCard }, // Added icon
      { name: "Payment History", href: '/fees/history', icon: CreditCard }, // Added icon
      { name: "Invoices & Receipts", href: '/fees/invoices', icon: CreditCard }, // Added icon
    ],
  },
  {
    name: "Admin",
    icon: Settings,
    href: '/admin',
    children: [
      { name: "User Management", href: '/admin/users', icon: Settings }, // Added icon
      { name: "System Settings", href: '/admin/settings', icon: Settings }, // Added icon
      { name: "Module Access", href: '/admin/modules', icon: Settings }, // Added icon
      { name: "Roles & Permissions", href: '/admin/roles', icon: Settings }, // Added icon
    ],
  },
  { name: "Logout", icon: LogOut, href: '/logout' },
]

// Add 'badge: false' to items that don't have a badge if 'badge' is still required
navigationItems.forEach(item => {
  if (!item.badge) {
    item.badge = false;
  }
  if (item.children) {
    item.children.forEach(child => {
      if (!child.badge) {
        child.badge = false;
      }
    });
  }
});

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(true);
  const { activeItem, setActiveItem } = useDashboard(); // Get both state and setter
  const { user } = useAuth(); // Access the user object from the AuthContext
  const [profileImage, setProfileImage] = useState<string | null>(null); // State for profile image
  // Handle navigation item click
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null); // State to track expanded sub-menus


  useEffect(() => {
    // Load user's profile image if available (replace with your actual logic)
    if (user?.id) {
      // Example: Fetch profile image URL from an API or use a default based on user ID
      // Replace this with your actual image loading mechanism
      setProfileImage(`/api/users/${user.id}/profile-image`);
    } else {
      setProfileImage('/images/default-user.png'); // Default image
    }
  }, [user?.id]);

  const toggleSubMenu = (itemName: string) => {
    setExpandedMenu(expandedMenu === itemName ? null : itemName);
  };

  return (
    <aside
      className={`relative flex h-full flex-col bg-white shadow-lg transition-all duration-300 ease-in-out dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 ${isOpen ? "w-64" : "w-20"
        }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-12 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Brand/Logo */}
      <div className="flex h-16 items-center px-4">
        <div className={`flex items-center ${isOpen ? "justify-start" : "justify-center w-full"}`}>
          <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="font-bold text-white text-xl">DB</span>
          </div>
          {isOpen && (
            <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Dashboard</span>
          )}
        </div>
      </div>

      {/* Search box */}
      {isOpen && (
        <div className="mx-4 my-4">
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 bg-gray-100 py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              placeholder="Search..."
            />
          </div>
        </div>
      )}

      {/* Menu items */}
      <nav className="mt-2 flex-1 space-y-1 px-2">
                {navigationItems.map((item) => (
                    <div key={item.name}>
                        <div
                            onClick={() => item.children ? toggleSubMenu(item.name) : setActiveItem(item.name)}
                            className={`group flex cursor-pointer items-center rounded-md px-2 py-3 text-sm font-medium transition-all duration-200 ${
                                activeItem === item.name && !item.children
                                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            } ${!isOpen && !item.children ? "justify-center" : ""}`}
                        >
                            <div className="relative">
                                <item.icon
                                    size={20}
                                    color={
                                        activeItem === item.name && !item.children
                                            ? "currentColor"
                                            : "currentColor"
                                    }
                                />
                                {item.badge && (
                                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            {isOpen && <span className="ml-3 flex-1">{item.name}</span>}
                            {item.children && isOpen && (
                                <div className="ml-auto">
                                    {expandedMenu === item.name ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            )}
                            {!isOpen && item.badge && (
                                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                                    {item.badge}
                                </span>
                            )}
                        </div>
                        {item.children && expandedMenu === item.name && isOpen && (
                            <div className="ml-6 space-y-1">
                                {item.children.map((subItem) => (
                                    <Link
                                        key={subItem.name}
                                        href={subItem.href}
                                        onClick={() => setActiveItem(subItem.name)}
                                        className={`block py-2 px-4 rounded-md text-sm transition-all duration-200 ${
                                            activeItem === subItem.name
                                                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                        }`}
                                    >
                                        {subItem.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

      {/* User profile */ }
          < Link href = "/dashboard/profile" className = {`flex items-center border-t border-gray-200 p-4 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${!isOpen ? "justify-center" : ""}`}>
        <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden relative">
          {profileImage ? (
            <Image src={profileImage} alt="User avatar" width={32} height={32} className="h-full w-full object-cover" />
          ) : (
            <Image src="/images/default-user.png" alt="Default user avatar" width={32} height={32} className="h-full w-full object-cover" />
          )}
        </div>
        {isOpen && user && (
          <div className="ml-3 truncate">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.full_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.role}</p>
          </div>
        )}
      </Link>
    </aside>
  );
}