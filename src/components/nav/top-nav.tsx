/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
"use client";

import { useEffect, useState } from "react";
import Container from "../container";
import { ThemeToggle } from "../theme-toggle";
import { Bell, Search, Menu, User, ChevronDown, LogOut, Settings, HelpCircle } from "lucide-react";
import { logout } from "@/services/auth";
import { useAuth } from "@/hooks/useAuth"; // Import your useAuth hook
import Image from "next/image"; // Import Image for profile picture
import { useRouter } from 'next/navigation'; // Replace react-router-dom import
import { Loader } from "@/components/ui/loader"; // Add this import
import { Button } from "../ui/button";

export default function TopNav({ title }: { title: string }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth(); // Access the user object from the AuthContext
  const [profileImage, setProfileImage] = useState<string | null>(null); // State for profile image
  const router = useRouter(); // Use Next.js router instead

  // Add these states for loading
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  useEffect(() => {
    if (user?.id) {
      // Replace with your actual image loading mechanism
      setProfileImage(`/api/users/${user.id}/profile-image`);
    } else {
      setProfileImage('/images/default-user.png'); // Default image
    }
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/login'); // Use Next.js navigation
    } catch (error: any) {
      console.error("Logout failed:", error.message);
      // Optionally display an error
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileClick = async () => {
    try {
      setIsLoadingProfile(true);
      await router.push('/profile'); // Use Next.js navigation
      setIsUserMenuOpen(false); // Close menu after navigation
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleNotificationClick = async () => {
    setIsLoadingNotifications(true);
    try {
      // Your notification loading logic here
      setIsNotificationsOpen(!isNotificationsOpen);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Mock data for notifications (keep this as is for now)
  const notifications = [
    { id: 1, message: "New comment on your post", time: "5m ago", read: false },
    { id: 2, message: "Your report is ready to download", time: "1h ago", read: false },
    { id: 3, message: "Server maintenance scheduled", time: "2h ago", read: true },
  ];

  return (
    <Container className="flex h-16 items-center justify-between border-b border-border">
      {/* Left side: Logo/Title and mobile menu toggle */}
      <div className="flex items-center gap-4">
        <Button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu size={20} />
        </Button>
        <h1 className="text-2xl font-medium">{title}</h1>
      </div>

      {/* Right side: Search, notifications, user menu */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="hidden md:flex items-center relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="rounded-md border border-border bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="p-2 rounded-md hover:bg-accent relative disabled:opacity-50"
            onClick={handleNotificationClick}
            disabled={isLoadingNotifications}
          >
            {isLoadingNotifications ? (
              <Loader size="sm" showText={false} />
            ) : (
              <>
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
                )}
              </>
            )}
          </button>

          {/* Notifications dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-md border border-border bg-card shadow-lg z-10">
              {/* ... notifications list ... */}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <div className="relative">
          <button
            className="flex items-center gap-2 p-1 pl-2 rounded-md hover:bg-accent disabled:opacity-50"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {isLoadingProfile ? (
                <Loader size="sm" showText={false} />
              ) : profileImage ? (
                <Image src={profileImage} alt="User avatar" width={32} height={32} className="h-full w-full object-cover" />
              ) : (
                <User size={16} className="text-primary" />
              )}
            </div>
            {user && <span className="hidden md:inline text-sm font-medium truncate">{user.full_name}</span>}
            <ChevronDown size={16} className="text-muted-foreground" />
          </button>

          {/* User dropdown menu */}
          {isUserMenuOpen && user && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-card shadow-lg z-10">
              <div className="p-2 border-b border-border">
                <div className="font-medium truncate">{user.full_name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
              <ul>
                <li>
                  <button 
                    onClick={handleProfileClick} 
                    className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2"
                    disabled={isLoadingProfile}
                  >
                    {isLoadingProfile ? (
                      <Loader size="sm" showText={false} />
                    ) : (
                      <User size={16} />
                    )}
                    <span>Profile</span>
                  </button>
                </li>
                <li>
                  <button 
                    className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2"
                    
                  >
                    {isLoadingSettings ? (
                      <Loader size="sm" showText={false} />
                    ) : (
                      <Settings size={16} />
                    )}
                    <span>Settings</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2">
                    <HelpCircle size={16} />
                    <span>Help</span>
                  </button>
                </li>
                <li className="border-t border-border">
                  <button 
                    onClick={handleLogout} 
                    className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2 text-red-500 disabled:opacity-50"
                    
                  >
                    {isLoggingOut ? (
                      <Loader size="sm" showText={false} className="text-red-500" />
                    ) : (
                      <LogOut size={16} />
                    )}
                    <span>Log out</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button
                className="p-2 rounded-md hover:bg-accent"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ✕
              </button>
            </div>
            <nav className="space-y-1">
              <a href="/dashboard" className="block px-3 py-2 rounded-md bg-primary/10 text-primary">Dashboard</a>
              {/* Add mobile links for other dashboard pages */}
            </nav>
          </div>
        </div>
      )}
    </Container>
  );
}