import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type NotFoundContent = {
  title: string;
  message: string;
  cta: { label: string; href: string };
};

const NotFound = () => {
  const location = useLocation();
  const { token } = useAuth();
  const [content, setContent] = useState<NotFoundContent | null>(null);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    let isMounted = true;

    async function loadNotFoundContent() {
      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/notfound`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const payload: NotFoundContent = await response.json();
        if (isMounted) {
          setContent(payload);
        }
      } catch (err) {
        console.warn("Failed to load custom not-found content", err);
      }
    }

    loadNotFoundContent();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{content?.title ?? "404"}</h1>
        <p className="mb-4 text-xl text-gray-600">{content?.message ?? "Oops! Page not found"}</p>
        <a href={content?.cta.href ?? "/"} className="text-blue-500 underline hover:text-blue-700">
          {content?.cta.label ?? "Return to Home"}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
