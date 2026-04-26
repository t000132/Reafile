"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/components/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [logoHovered, setLogoHovered] = useState(false);
  const { user, signOut, loading } = useAuth();

  const handleSignIn = () => {
    setAuthMode("signin");
    setAuthModalOpen(true);
  };

  const handleSignUp = () => {
    setAuthMode("signup");
    setAuthModalOpen(true);
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo with hover dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            <Link href="/" className="flex items-center gap-2.5">
              <span className="text-lg font-semibold tracking-tight">Reafile</span>
            </Link>
            
            {/* App Links Dropdown */}
            {logoHovered && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -left-4 top-full -mt-1"
              >
                {/* Invisible bridge to prevent gap - extends upward slightly */}
                <div className="h-3 w-full pointer-events-auto" />
                <div className="w-48 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-lg pointer-events-auto">
                  <div className="flex flex-col p-2">
                    <Link
                      href="https://reawon.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <Image
                        src="/reawon_logo_black.png"
                        alt="Reawon"
                        width={18}
                        height={18}
                        className="block dark:hidden"
                      />
                      <Image
                        src="/reawon_logo_white.png"
                        alt="Reawon"
                        width={18}
                        height={18}
                        className="hidden dark:block"
                      />
                      <span className="flex-1 font-[family-name:var(--font-conthrax)] text-foreground">Reawon</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </Link>
                    <Link
                      href="https://polywon.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <Image
                        src="/polywon_logo.png"
                        alt="Polywon"
                        width={18}
                        height={18}
                        className="rounded"
                      />
                      <span className="flex-1 font-[family-name:var(--font-poppins)] text-foreground">Polywon</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Links + Theme toggle */}
          <nav className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link
              href="/#pricing"
              className="transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <div className="mx-1 h-4 w-px bg-border" />
            <ThemeToggle />
            <div className="mx-1 h-4 w-px bg-border" />
            
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-medium">
                          {user.email?.[0].toUpperCase()}
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">Account</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-sm font-medium"
                      onClick={handleSignIn}
                    >
                      Log in
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 px-3 text-sm font-medium bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600"
                      onClick={handleSignUp}
                    >
                      Sign up
                    </Button>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </motion.header>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={authMode}
      />
    </>
  );
}
