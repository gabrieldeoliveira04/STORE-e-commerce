"use client";
import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Sun,
  Moon,
  Laptop,
  ChevronUp,
  ChevronDown,
  CircleUserRound,
  Slack,
  // Palette,
  // MessageCircle,
  UsersRound,
  ShoppingBag,
  ShoppingCart,
  LogOut,
  UserRoundPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { siteConfig } from "@/config/site";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { localstorageService } from "@/services/localstorage.service";
import { AuthContext } from "@/contexts/auth.ctx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { useCart } from "@/contexts/cart.ctx";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const { user, handleExitUser } = useContext(AuthContext);
  const { totalQuantity } = useCart();

  const navigation = [
    { name: "Início", href: "/" },
    { name: "Produtos", href: "/produtos" },
  ];

  const isActive = (href: string) => pathname === href;

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Laptop className="h-4 w-4" />;
    }
  };

  const handleLogout = () => {
    localstorageService.removeDataUserIsLogged();
    handleExitUser();
    router.push("/login");
  };

  const goToSettings = () => {
    router.push("/configuracao-de-usuario");
  };

  const handleChangeBaseColor = (color: string) => {
    setSelectedColor(color);
    localStorage.setItem("color-base", color);
    document.documentElement.style.setProperty("--color-base", color);
  };

  useEffect(() => {
    const savedColor = localStorage.getItem("color-base");
    if (savedColor) {
      handleChangeBaseColor(savedColor);
    } else {
      handleChangeBaseColor("#FE7F2D"); // fallback
    }
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <span className="dark:text-white font-bold text-lg">
                  <Slack />
                </span>
              </div>
              <span className="font-serif text-xl font-semibold text-foreground">
                {siteConfig.name}
              </span>
            </Link>

            {/* Sidebar só aparece se estiver logado */}
            {user?.token && (
              <Sheet>
                {/* Botão Trigger elegante */}
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 p-3 rounded-full hover:bg-sunset/20 transition-all shadow-sm group"
                    aria-label="Abrir área restrita"
                  >
                    <ArrowRight className="h-6 w-6 text-sunset transition-transform duration-300 group-hover:scale-110" />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="w-72 sm:w-80 bg-background/95 backdrop-blur-md border-r border-border/30 shadow-2xl rounded-r-xl"
                >
                  {/* Cabeçalho */}
                  <SheetHeader className="pb-2 border-b border-sunset/30 mt-4">
                    <SheetTitle className="text-xl md:text-2xl font-bold text-foreground">
                      Menus de Administração
                    </SheetTitle>
                  </SheetHeader>

                  {/* Navegação principal */}
                  <nav className="flex flex-col gap-4 mt-6 px-2">
                    {/* Controle de Usuários */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem
                        value="users"
                        className="rounded-xl transition-colors shadow-md"
                      >
                        <AccordionTrigger className="flex justify-between items-center text-xl font-semibold text-foreground hover:text-sunset transition-colors">
                          <span className="flex items-center">
                            {/* Ícone opcional */}
                            <span className="flex items-center justify-center h-8 w-8 bg-sunset rounded-full mx-2">
                              <UsersRound className="h-5 w-5 text-white" />
                            </span>
                            Controle de Usuários
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pl-8 flex flex-col gap-4 mt-2 md:text-base text-muted-foreground">
                          <Link
                            href="/usuario/admin/novo-usuario"
                            className="flex items-center gap-2 dark:text-white text-black hover:text-sunset transition-colors"
                          >
                            Adicionar Usuário
                          </Link>
                          <Link
                            href="/usuario/admin/lista-usuarios"
                            className="flex items-center gap-2 dark:text-white text-black hover:text-sunset transition-colors"
                          >
                            Listar Usuários
                          </Link>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Produtos */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem
                        value="products"
                        className="rounded-xl transition-colors shadow-md"
                      >
                        <AccordionTrigger className="flex justify-between items-center text-xl font-semibold text-foreground hover:text-sunset transition-colors">
                          <span className="flex items-center">
                            <span className="flex items-center justify-center h-8 w-8 bg-sunset rounded-full mx-2">
                              <ShoppingBag className="h-5 w-5 text-white" />
                            </span>
                            Produtos
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pl-8 flex flex-col gap-4 mt-2 md:text-base text-muted-foreground">
                          <Link
                            href="/produtos/admin/novo-produto"
                            className="flex items-center gap-2 dark:text-white text-black hover:text-sunset transition-colors"
                          >
                            Adicionar Produto
                          </Link>
                          <Link
                            href="/produtos/admin/lista-produtos"
                            className="flex items-center gap-2 dark:text-white text-black hover:text-sunset transition-colors"
                          >
                            Listar Produtos
                          </Link>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Theme Toggle, User Menu & Mobile Menu */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={cycleTheme}
              className="w-9 h-9"
            >
              {getThemeIcon()}
            </Button>

            {/* Só mostra o dropdown se estiver logado */}
            {user?.token && (
              <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2.5 min-h-10 bg-nc-base-800 rounded-[5px] px-2 cursor-pointer mr-1">
                    <CircleUserRound className="min-h-[30px] min-w-[30px]" />
                    <span className="text-sm text-black dark:text-white pr-8">
                      {user?.name}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </DropdownMenuTrigger>
                {/* Carrinho */}
                {user?.token && (
                  <Link href="/carrinho" className="relative">
                    <ShoppingCart className="h-6 w-6 text-foreground" />
                    {totalQuantity > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {totalQuantity}
                      </span>
                    )}
                  </Link>
                )}

                <DropdownMenuContent className="rounded-lg shadow-lg min-w-[var(--radix-dropdown-menu-trigger-width)]">
                  {/* Personalização de Cor */}
                  <DropdownMenuLabel className="px-2 font-normal">
                    Personalização de cor
                  </DropdownMenuLabel>

                  <div className="flex gap-2 items-center justify-center py-2">
                    {[
                      { color: "#f7b801", label: "Yellow" },
                      { color: "#db504a", label: "Jasper" },
                      { color: "#7678ed", label: "Slate Blue" },
                      { color: "#66cccc", label: "Aqua Green" },
                      { color: "#339933", label: "Green" },
                      { color: "#FE7F2D", label: "Sunset" },
                    ].map(({ color, label }) => {
                      const selected = selectedColor === color;
                      return (
                        <button
                          key={color}
                          onClick={() => handleChangeBaseColor(color)}
                          className={`
                            w-4 h-4 rounded-full border transition
                            ${selected ? "ring-2 ring-offset-1 ring-adventure border-white" : "border-gray-400"}
                            hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 cursor-pointer
                          `}
                          style={{ backgroundColor: color }}
                          title={label}
                          aria-label={`Selecionar cor ${label}`}
                        />
                      );
                    })}
                  </div>

                  <DropdownMenuSeparator className="border-nc-base-400" />

                  {/* Configurações de Conta */}
                  <DropdownMenuItem
                    onClick={goToSettings}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    Configurações de conta <UserRoundPen />
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="border-nc-base-400" />

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    Sair da conta <LogOut />
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="border-nc-base-400" />

                  {/* Versão */}
                  <DropdownMenuLabel className="text-xs text-center text-sunset-dark px-3 py-2">
                    Versão {process.env.NEXT_PUBLIC_APP_VERSION}
                  </DropdownMenuLabel>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-9 h-9"
            >
              {isMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background border-b border-border/50"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
