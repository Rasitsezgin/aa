"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  url?: string;
  type: "LINK" | "DROPDOWN" | "MEGA_MENU" | "DIVIDER" | "LABEL";
  icon?: string;
  description?: string;
  isActive: boolean;
  isHighlighted: boolean;
  highlightColor?: string;
  imageUrl?: string;
  columns?: number;
  children?: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  type: string;
  location: string;
  items: MenuItem[];
}

interface DynamicMegaMenuProps {
  location?: string;
  className?: string;
}

export function DynamicMegaMenu({ location = "header", className = "" }: DynamicMegaMenuProps) {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, [location]);

  const fetchMenu = async () => {
    try {
      const response = await fetch(`/api/menus?location=${location}`);
      if (response.ok) {
        const data = await response.json();
        setMenu(data);
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  const renderMenuItem = (item: MenuItem, isMobile = false) => {
    if (!item.isActive) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isHighlighted = item.isHighlighted;
    const highlightStyle = isHighlighted && item.highlightColor
      ? { color: item.highlightColor.startsWith('#') ? item.highlightColor : undefined }
      : {};

    const baseClasses = isMobile
      ? "block py-3 px-4 text-sm font-medium border-b border-slate-100"
      : "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:text-orange-600";

    const highlightedClasses = isHighlighted
      ? `text-${item.highlightColor || 'orange-600'} font-semibold`
      : "text-slate-700";

    if (item.type === "DIVIDER") {
      return isMobile ? (
        <hr key={item.id} className="my-2 border-slate-200" />
      ) : (
        <div key={item.id} className="w-px h-6 bg-slate-200 mx-2" />
      );
    }

    if (item.type === "LABEL") {
      return (
        <span
          key={item.id}
          className={`${baseClasses} text-slate-400 text-xs uppercase tracking-wider`}
        >
          {item.label}
        </span>
      );
    }

    if (hasChildren) {
      return (
        <div
          key={item.id}
          className="relative group"
          onMouseEnter={() => !isMobile && setActiveDropdown(item.id)}
          onMouseLeave={() => !isMobile && setActiveDropdown(null)}
        >
          <button
            className={`${baseClasses} ${highlightedClasses} flex items-center gap-1`}
            style={highlightStyle}
            onClick={() => isMobile && setActiveDropdown(activeDropdown === item.id ? null : item.id)}
          >
            {getIcon(item.icon)}
            {item.label}
            <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.id ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {activeDropdown === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={`
                  ${isMobile
                    ? "relative w-full bg-slate-50"
                    : "absolute top-full left-0 z-50 min-w-[200px] bg-white rounded-lg shadow-xl border border-slate-100 py-2"
                  }
                `}
              >
                {item.type === "MEGA_MENU" && item.children && item.children.length > 0 ? (
                  renderMegaMenu(item)
                ) : (
                  <div className={isMobile ? "py-2" : ""}>
                    {item.children?.filter(child => child.isActive).map((child) => (
                      <Link
                        key={child.id}
                        href={child.url || "#"}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-orange-600"
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                      >
                        {getIcon(child.icon)}
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.url || "#"}
        className={`${baseClasses} ${highlightedClasses}`}
        style={highlightStyle}
        onClick={() => isMobile && setMobileMenuOpen(false)}
      >
        {getIcon(item.icon)}
        {item.label}
      </Link>
    );
  };

  const renderMegaMenu = (item: MenuItem) => {
    const columns = item.columns || 3;
    const children = item.children?.filter(child => child.isActive) || [];

    return (
      <div className="p-6">
        <div className="flex gap-6">
          {/* Left side - Image if available */}
          {item.imageUrl && (
            <div className="w-48 flex-shrink-0">
              <img
                src={item.imageUrl}
                alt={item.label}
                className="w-full h-32 object-cover rounded-lg"
              />
              {item.description && (
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              )}
            </div>
          )}

          {/* Right side - Columns */}
          <div className={`grid gap-6 flex-1`} style={{ gridTemplateColumns: `repeat(${Math.min(columns, children.length)}, 1fr)` }}>
            {children.map((column) => (
              <div key={column.id}>
                {column.children ? (
                  <>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      {getIcon(column.icon)}
                      {column.label}
                    </h4>
                    <ul className="space-y-2">
                      {column.children.filter(child => child.isActive).map((child) => (
                        <li key={child.id}>
                          <Link
                            href={child.url || "#"}
                            className="text-sm text-slate-600 hover:text-orange-600 flex items-center gap-2"
                          >
                            {getIcon(child.icon)}
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    href={column.url || "#"}
                    className="flex items-center gap-2 text-slate-700 hover:text-orange-600"
                  >
                    {getIcon(column.icon)}
                    <span className="font-medium">{column.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`h-16 flex items-center ${className}`}>
        <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!menu || !menu.items || menu.items.length === 0) {
    return null;
  }

  return (
    <nav className={className}>
      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center gap-1">
        {menu.items.filter(item => item.isActive).map((item) => renderMenuItem(item))}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden p-2 text-slate-700"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50"
          >
            <div className="py-2">
              {menu.items.filter(item => item.isActive).map((item) => renderMenuItem(item, true))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
