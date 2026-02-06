import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useHeaderVisibility } from "@/hooks/useHeaderVisibility";
import { SearchBar } from "@/components/SearchBar";
import logo from "@/assets/logo-brutal.png";

const WHATSAPP_NUMBER = "541147180732"; // +54 (11) 4718-0732

const navigation = [
  { name: "INICIO", href: "/" },
  { name: "RENTAL", href: "/equipos" },
  { name: "GALERÍA", href: "/galeria" },
  { name: "SALA", href: "/sala-grabacion" },
  // { name: "SERVICIOS", href: "/servicios" },
  { name: "CONTACTO", href: "/contacto" },
  { name: "PRESUPUESTO", href: "/cotizador" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isVisible, setIsVisible, isHovering, setIsHovering, isMobile } = useHeaderVisibility();
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep visible when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      setIsVisible(true);
    }
  }, [mobileMenuOpen, setIsVisible]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!mobileMenuOpen) return;
      const target = event.target as Node;
      const isOutsideMenu = me
