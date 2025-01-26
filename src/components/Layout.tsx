import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils"; // Updated to use the correct relative path
import { Button } from "../components/ui/button"; // Updated to use the correct relative path
import { Home, Users, Settings, Power } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Users", href: "/users", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed inset-y-0 z-50 flex w-72 flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card px-6 pb-4 ring-1 ring-border/5">
            <div className="flex h-16 shrink-0 items-center">
              <img
                className="h-8 w-auto"
                src="/lovable-uploads/5b365417-f2a4-4acf-9b1c-9fdcb92cc02e.png"
                alt="Logo"
              />
              <span className="ml-4 text-lg font-semibold">UpSnap</span>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            className={cn(
                              location.pathname === item.href
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                              "group flex gap-x-3 rounded-md p-2 text-sm leading-6"
                            )}
                          >
                            <Icon className="h-6 w-6 shrink-0" />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
                <li className="mt-auto">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-x-3"
                    asChild
                  >
                    <Link to="/account">
                      <Power className="h-6 w-6" />
                      <span className="text-sm font-semibold leading-6">
                        Account
                      </span>
                    </Link>
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <main className="pl-72 w-full">
          <div className="px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
