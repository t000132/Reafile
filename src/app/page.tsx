"use client";

import { motion } from "framer-motion";
import {
  RefreshCw,
  Scissors,
  ImageIcon,
  Maximize2,
  RotateCw,
  Droplet,
  FileImage,
  Combine,
  Sparkles,
  Eraser,
  Shield,
  Zap,
  Globe,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface FeatureCard {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  href: string;
  available: boolean;
}

const features: FeatureCard[] = [
  {
    title: "Convert",
    description: "Transform files between 120+ formats",
    icon: RefreshCw,
    color: "from-violet-500 to-purple-600",
    href: "/convert",
    available: true,
  },
  {
    title: "Compress",
    description: "Reduce file size while keeping quality",
    icon: Sparkles,
    color: "from-blue-500 to-cyan-600",
    href: "/compress",
    available: false,
  },
  {
    title: "Resize",
    description: "Change dimensions of your images",
    icon: Maximize2,
    color: "from-emerald-500 to-green-600",
    href: "/resize",
    available: false,
  },
  {
    title: "Crop",
    description: "Cut and trim your images precisely",
    icon: Scissors,
    color: "from-amber-500 to-orange-600",
    href: "/crop",
    available: false,
  },
  {
    title: "Rotate",
    description: "Rotate images to any angle",
    icon: RotateCw,
    color: "from-pink-500 to-rose-600",
    href: "/rotate",
    available: false,
  },
  {
    title: "Watermark",
    description: "Add text or image watermarks",
    icon: Droplet,
    color: "from-indigo-500 to-blue-600",
    href: "/watermark",
    available: false,
  },
  {
    title: "Remove Background",
    description: "Instantly remove image backgrounds",
    icon: Eraser,
    color: "from-teal-500 to-cyan-600",
    href: "/remove-bg",
    available: false,
  },
  {
    title: "Image to PDF",
    description: "Convert images to PDF documents",
    icon: FileImage,
    color: "from-red-500 to-orange-600",
    href: "/image-to-pdf",
    available: false,
  },
  {
    title: "Merge Files",
    description: "Combine multiple files into one",
    icon: Combine,
    color: "from-purple-500 to-pink-600",
    href: "/merge",
    available: false,
  },
  {
    title: "Split Files",
    description: "Separate files into multiple parts",
    icon: Scissors,
    color: "from-orange-500 to-red-600",
    href: "/split",
    available: false,
  },
  {
    title: "Upscale Image",
    description: "Enhance image resolution with AI",
    icon: Maximize2,
    color: "from-cyan-500 to-blue-600",
    href: "/upscale",
    available: false,
  },
  {
    title: "Blur Face",
    description: "Automatically blur faces in photos",
    icon: ImageIcon,
    color: "from-slate-500 to-gray-600",
    href: "/blur-face",
    available: false,
  },
  {
    title: "Photo Editor",
    description: "Edit photos with filters and effects",
    icon: ImageIcon,
    color: "from-fuchsia-500 to-pink-600",
    href: "/photo-editor",
    available: false,
  },
  {
    title: "Meme Generator",
    description: "Create memes with custom text",
    icon: ImageIcon,
    color: "from-yellow-500 to-orange-600",
    href: "/meme-generator",
    available: false,
  },
  {
    title: "PDF to Word",
    description: "Convert PDF to editable Word docs",
    icon: RefreshCw,
    color: "from-blue-600 to-indigo-600",
    href: "/pdf-to-word",
    available: false,
  },
  {
    title: "Word to PDF",
    description: "Convert Word documents to PDF",
    icon: RefreshCw,
    color: "from-indigo-600 to-purple-600",
    href: "/word-to-pdf",
    available: false,
  },
  {
    title: "PDF to Excel",
    description: "Extract data from PDF to Excel",
    icon: RefreshCw,
    color: "from-green-600 to-emerald-600",
    href: "/pdf-to-excel",
    available: false,
  },
  {
    title: "Excel to PDF",
    description: "Convert Excel spreadsheets to PDF",
    icon: RefreshCw,
    color: "from-emerald-600 to-teal-600",
    href: "/excel-to-pdf",
    available: false,
  },
  {
    title: "PDF to PowerPoint",
    description: "Convert PDF to PPT presentations",
    icon: RefreshCw,
    color: "from-red-600 to-orange-600",
    href: "/pdf-to-ppt",
    available: false,
  },
  {
    title: "PowerPoint to PDF",
    description: "Convert presentations to PDF",
    icon: RefreshCw,
    color: "from-orange-600 to-amber-600",
    href: "/ppt-to-pdf",
    available: false,
  },
  {
    title: "Edit PDF",
    description: "Add text and images to PDFs",
    icon: ImageIcon,
    color: "from-violet-600 to-purple-600",
    href: "/edit-pdf",
    available: false,
  },
  {
    title: "Sign PDF",
    description: "Digitally sign PDF documents",
    icon: ImageIcon,
    color: "from-blue-700 to-indigo-700",
    href: "/sign-pdf",
    available: false,
  },
  {
    title: "Protect PDF",
    description: "Add password protection to PDFs",
    icon: Lock,
    color: "from-slate-600 to-gray-700",
    href: "/protect-pdf",
    available: false,
  },
  {
    title: "Unlock PDF",
    description: "Remove password from PDFs",
    icon: Lock,
    color: "from-gray-600 to-slate-700",
    href: "/unlock-pdf",
    available: false,
  },
  {
    title: "Organize PDF",
    description: "Rearrange and delete PDF pages",
    icon: ImageIcon,
    color: "from-amber-600 to-yellow-600",
    href: "/organize-pdf",
    available: false,
  },
  {
    title: "Page Numbers",
    description: "Add page numbers to PDFs",
    icon: ImageIcon,
    color: "from-lime-600 to-green-600",
    href: "/page-numbers",
    available: false,
  },
  {
    title: "OCR PDF",
    description: "Make scanned PDFs searchable",
    icon: ImageIcon,
    color: "from-teal-600 to-cyan-700",
    href: "/ocr-pdf",
    available: false,
  },
  {
    title: "Compare PDF",
    description: "Compare two PDF documents",
    icon: ImageIcon,
    color: "from-sky-600 to-blue-700",
    href: "/compare-pdf",
    available: false,
  },
  {
    title: "Repair PDF",
    description: "Fix corrupted PDF files",
    icon: ImageIcon,
    color: "from-rose-600 to-red-700",
    href: "/repair-pdf",
    available: false,
  },
  {
    title: "HTML to PDF",
    description: "Convert web pages to PDF",
    icon: RefreshCw,
    color: "from-purple-600 to-fuchsia-600",
    href: "/html-to-pdf",
    available: false,
  },
];

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
      {/* ── Animated gradient background ──────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs - more vibrant and visible */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0.3, 0.4, 0.3],
            scale: [0.8, 1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            opacity: { duration: 1.5, times: [0, 0.3, 0.5, 1] },
            scale: { duration: 1.5, times: [0, 0.3, 0.5, 1] },
            x: { duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
            y: { duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
          }}
          className="absolute -top-[30%] left-1/4 h-[900px] w-[900px] rounded-full bg-violet-500/30 dark:bg-violet-500/20 blur-[120px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0.25, 0.35, 0.25],
            scale: [0.8, 1, 1.3, 1],
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{
            opacity: { duration: 1.8, times: [0, 0.3, 0.5, 1], delay: 0.3 },
            scale: { duration: 1.8, times: [0, 0.3, 0.5, 1], delay: 0.3 },
            x: { duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 },
            y: { duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 },
          }}
          className="absolute top-[10%] right-[10%] h-[700px] w-[700px] rounded-full bg-blue-500/25 dark:bg-blue-500/15 blur-[100px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0.2, 0.3, 0.2],
            scale: [0.8, 1, 1.25, 1],
            x: [0, 120, 0],
            y: [0, -60, 0],
          }}
          transition={{
            opacity: { duration: 2, times: [0, 0.3, 0.5, 1], delay: 0.6 },
            scale: { duration: 2, times: [0, 0.3, 0.5, 1], delay: 0.6 },
            x: { duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2.6 },
            y: { duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2.6 },
          }}
          className="absolute bottom-[5%] left-[15%] h-[800px] w-[800px] rounded-full bg-emerald-500/20 dark:bg-emerald-500/12 blur-[110px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0.2, 0.28, 0.2],
            scale: [0.8, 1, 1.15, 1],
            x: [0, -100, 0],
            y: [0, -80, 0],
          }}
          transition={{
            opacity: { duration: 2.2, times: [0, 0.3, 0.5, 1], delay: 0.9 },
            scale: { duration: 2.2, times: [0, 0.3, 0.5, 1], delay: 0.9 },
            x: { duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3.1 },
            y: { duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3.1 },
          }}
          className="absolute top-[50%] left-[60%] h-[600px] w-[600px] rounded-full bg-pink-500/20 dark:bg-pink-500/10 blur-[100px]"
        />
        {/* Subtle animated mesh gradient overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(0_0_0/0.04)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.03)_1px,transparent_0)] [background-size:40px_40px]"
        />
      </div>

      {/* ── Main content — fills viewport ────────────────────── */}
      <div className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-full max-w-[1400px]"
        >
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Your file toolbox.{" "}
              <span className="bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 bg-clip-text text-transparent">
                All in one place.
              </span>
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Convert, compress, resize, and more — 100% private & secure
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const row = Math.floor(index / 6); // Calculate which row the item is in
              const content = (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: row * 0.08,
                    ease: "easeOut"
                  }}
                  className={`group relative overflow-hidden rounded-2xl border-2 border-border/80 bg-background/80 dark:bg-background/70 backdrop-blur-xl shadow-md transition-all duration-200 min-h-[180px] flex flex-col ${
                    feature.available
                      ? "cursor-pointer hover:border-border hover:bg-background/90 dark:hover:bg-background/85 hover:shadow-xl hover:shadow-black/10 hover:scale-[1.02]"
                      : "cursor-not-allowed opacity-50"
                  }`}
                >
                  <div className="flex h-full flex-col p-5 flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg shrink-0`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {!feature.available && (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                          Soon
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold mb-2">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  {feature.available && (
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-violet-500/[0.03] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  )}
                </motion.div>
              );

              return feature.available ? (
                <Link key={feature.title} href={feature.href}>
                  {content}
                </Link>
              ) : (
                <div key={feature.title}>{content}</div>
              );
            })}
          </div>

          {/* ── Feature chips — inline, no scroll ──────────── */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Lock, label: "100% Private", color: "text-violet-500" },
              { icon: Zap, label: "Lightning Fast", color: "text-blue-500" },
              { icon: Globe, label: "Works Offline", color: "text-emerald-500" },
              { icon: Shield, label: "Free Forever", color: "text-amber-500" },
            ].map(({ icon: Icon, label, color }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-4 py-3"
              >
                <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                <span className="text-sm font-medium">{label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
