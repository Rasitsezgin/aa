"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";

interface FooterLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  isExternal: boolean;
  isActive: boolean;
}

interface FooterColumn {
  id: string;
  title: string;
  isActive: boolean;
  links: FooterLink[];
}

interface FooterBottomBar {
  copyright?: string;
  showCopyright: boolean;
  showSocial: boolean;
  socialLinks: { platform: string; url: string; icon: string }[];
  showPaymentIcons: boolean;
  paymentIcons: { name: string; url: string }[];
}

interface Footer {
  id: string;
  name: string;
  location: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  logoUrl?: string;
  logoText?: string;
  tagline?: string;
  columns: FooterColumn[];
  bottomBar?: FooterBottomBar;
}

interface DynamicFooterProps {
  location?: string;
  className?: string;
}

export function DynamicFooter({ location = "main", className = "" }: DynamicFooterProps) {
  const [footer, setFooter] = useState<Footer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFooter();
  }, [location]);

  const fetchFooter = async () => {
    try {
      const response = await fetch(`/api/footers?location=${location}`);
      if (response.ok) {
        const data = await response.json();
        setFooter(data);
      }
    } catch (error) {
      console.error("Error fetching footer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  if (isLoading) {
    return (
      <footer className={`bg-slate-900 py-12 ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-700 rounded w-1/4" />
            <div className="h-4 bg-slate-700 rounded w-1/2" />
          </div>
        </div>
      </footer>
    );
  }

  if (!footer || !footer.isActive) {
    return null;
  }

  const bgColor = footer.bgColor || "bg-slate-900";
  const textColor = footer.textColor || "text-white";
  const borderColor = footer.borderColor || "border-slate-800";

  const activeColumns = footer.columns.filter((col) => col.isActive);

  return (
    <footer className={`${bgColor} ${textColor} ${className}`}>
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo/Tagline Column */}
          {(footer.logoUrl || footer.logoText || footer.tagline) && (
            <div className="lg:col-span-1">
              {footer.logoUrl ? (
                <img
                  src={footer.logoUrl}
                  alt={footer.logoText || "Logo"}
                  className="h-8 w-auto mb-4"
                />
              ) : footer.logoText ? (
                <h3 className="text-xl font-bold mb-4">{footer.logoText}</h3>
              ) : null}
              {footer.tagline && (
                <p className="text-sm opacity-70">{footer.tagline}</p>
              )}
            </div>
          )}

          {/* Link Columns */}
          {activeColumns.map((column) => (
            <div key={column.id}>
              <h4 className="font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links
                  .filter((link) => link.isActive)
                  .map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.url}
                        className="text-sm opacity-70 hover:opacity-100 transition-opacity flex items-center gap-2"
                        target={link.isExternal ? "_blank" : undefined}
                        rel={link.isExternal ? "noopener noreferrer" : undefined}
                      >
                        {getIcon(link.icon)}
                        {link.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      {footer.bottomBar && (
        <div className={`border-t ${borderColor}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              {footer.bottomBar.showCopyright && footer.bottomBar.copyright && (
                <p className="text-sm opacity-60">{footer.bottomBar.copyright}</p>
              )}

              <div className="flex items-center gap-6">
                {/* Social Links */}
                {footer.bottomBar.showSocial && footer.bottomBar.socialLinks && (
                  <div className="flex items-center gap-3">
                    {footer.bottomBar.socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-60 hover:opacity-100 transition-opacity"
                      >
                        {getIcon(social.icon) || <span className="text-xs">{social.platform}</span>}
                      </a>
                    ))}
                  </div>
                )}

                {/* Payment Icons */}
                {footer.bottomBar.showPaymentIcons && footer.bottomBar.paymentIcons && (
                  <div className="flex items-center gap-2">
                    {footer.bottomBar.paymentIcons.map((payment, index) => (
                      <div
                        key={index}
                        className="bg-white/10 rounded px-2 py-1"
                      >
                        {payment.url ? (
                          <img
                            src={payment.url}
                            alt={payment.name}
                            className="h-6 w-auto"
                          />
                        ) : (
                          <span className="text-xs">{payment.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
