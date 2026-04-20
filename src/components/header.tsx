"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-lg font-semibold tracking-tight">Reafile</span>
        </Link>

        {/* Links + Theme toggle */}
        <nav className="flex items-center gap-3 text-sm text-muted-foreground">
          <Link
            href="https://reawon.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 transition-colors hover:text-foreground sm:flex"
          >
            <Image
              src="/reawon_logo_black.png"
              alt="Reawon"
              width={20}
              height={20}
              className="block dark:hidden"
            />
            <Image
              src="/reawon_logo_white.png"
              alt="Reawon"
              width={20}
              height={20}
              className="hidden dark:block"
            />
            <span className="font-[family-name:var(--font-conthrax)]">Reawon</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="https://polywon.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Image
              src="/polywon_logo.png"
              alt="Polywon"
              width={20}
              height={20}
              className="rounded"
            />
            <span className="hidden font-[family-name:var(--font-poppins)] sm:inline">Polywon</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <div className="mx-1 h-4 w-px bg-border" />
          <ThemeToggle />
        </nav>
      </div>
    </motion.header>
  );
}
