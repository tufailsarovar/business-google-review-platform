import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getMyBusiness } from "../services/businessService";
import useAuth from "../hooks/useAuth";

export const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBusiness = useCallback(async () => {
    if (!user || user.role !== "business") {
      setBusiness(null);
      setError("");
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getMyBusiness();
      const data = response?.data?.business || response?.business || null;

      if (!data) {
        throw new Error("Business information was not returned.");
      }

      setBusiness(data);
      return data;
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load business information.",
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== "business") {
      setBusiness(null);
      setError("");
      setLoading(false);
      return;
    }

    fetchBusiness();
  }, [authLoading, user, fetchBusiness]);

  const updateBusinessState = useCallback((updatedBusiness) => {
    setBusiness(updatedBusiness || null);
    setError("");
  }, []);

  const clearBusiness = useCallback(() => {
    setBusiness(null);
    setError("");
  }, []);

  const value = useMemo(
    () => ({
      business,
      setBusiness: updateBusinessState,
      fetchBusiness,
      clearBusiness,
      loading: authLoading || loading,
      error,
    }),
    [
      business,
      updateBusinessState,
      fetchBusiness,
      clearBusiness,
      authLoading,
      loading,
      error,
    ],
  );

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export default BusinessProvider;
