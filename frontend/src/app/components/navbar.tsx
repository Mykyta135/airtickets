// components/navbar.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/provider/AuthProvider";
import { Button } from "@/src/app/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/src/app/components/ui/navigation-menu";
import { Avatar, AvatarFallback } from "@/src/app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/app/components/ui/dropdown-menu";
import { Plane, User, LogOut, Ticket, Calendar, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/src/i18n/navigation";
export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname(); // This is already locale-aware
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, {locale: newLocale});
    router.refresh(); // Optional: forces server-side revalidation if needed
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Globe className="w-4 h-4 mr-2" />
          {locale.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {['uk', 'en']
          .filter((l) => l !== locale)
          .map((l) => (
            <DropdownMenuItem
              key={l}
              onClick={() => handleLocaleChange(l)}
              className="cursor-pointer"
            >
              {l.toUpperCase()}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const t = useTranslations("Header");
  return (
    <header className="border-b ">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Plane className="h-6 w-6" />
          <span className="text-xl font-bold">SkyJet</span>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/"
                className={navigationMenuTriggerStyle()}
              >
                {t("home")}
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/refunds"
                className={navigationMenuTriggerStyle()}
              >
                {t("takeRefund")}
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>{t("travelInfo")}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <li>
                    <Link
                      href="/info/baggage"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        {t("baggage.title")}
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {t("baggage.description")}
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/info/check-in"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        {t("checkIn.title")}
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {t("checkIn.description")}
                      </p>
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageSwitcher></LanguageSwitcher>
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    <span>{t("profile")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/bookings"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>{t("myTickets")}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("logOut")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">{t("logIn")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">{t("signUp")}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
