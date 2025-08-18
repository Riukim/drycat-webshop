"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"

// Componente Logo
const Logo = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-lg">S</span>
      </div>
      <span className="text-xl font-semibold text-foreground">Snippets</span>
    </div>
  );
};

// Tipo per l'utente
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

// Hook personalizzato per gestire l'autenticazione
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
};

// Componenti per i pulsanti di autenticazione
const SignInButton = ({ children }: { children: React.ReactNode }) => {
  const handleSignIn = () => {
    // Reindirizza alla pagina di login
    window.location.href = '/auth/signin';
  };

  return (
    <div onClick={handleSignIn} className="cursor-pointer">
      {children}
    </div>
  );
};

const SignUpButton = ({ children }: { children: React.ReactNode }) => {
  const handleSignUp = () => {
    // Reindirizza alla pagina di registrazione
    window.location.href = '/register';
  };

  return (
    <div onClick={handleSignUp} className="cursor-pointer">
      {children}
    </div>
  );
};

const Navbar = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <nav className="flex mt-4 mx-6 max-sm:mt-9 items-center justify-between max-sm:flex-col">
        <Link href="/">
          <Logo />
        </Link>
        <div className="max-sm:w-full">
          <div className="animate-pulse bg-gray-200 h-10 w-32 rounded-md max-sm:mt-8"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex mt-4 mx-6 max-sm:mt-9 items-center justify-between max-sm:flex-col">
      <Link href="/">
        <Logo />
      </Link>
      <div className="max-sm:w-full">
        {user ? (
          <Link href="/my-snippets">
            <Button className="max-sm:w-full bg-primary p-[8px] px-6 text-sm text-white rounded-md max-sm:mt-8">
              Access To The App
            </Button>
          </Link>
        ) : (
          <div className="flex gap-2 max-sm:flex-col max-sm:w-full max-sm:mt-8">
            <SignInButton>
              <Button
                variant="default"
                className="cursor-pointer max-sm:w-full p-[8px] px-6 text-sm text-white rounded-md"
              >
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button
                variant="outline"
                className="cursor-pointer text-sm text-foreground hover:text-white p-[8px] px-6 rounded-md"
              >
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;