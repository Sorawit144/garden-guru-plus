import { useEffect, useState } from "react";
import type { PlanTier } from "@/lib/organization-data";

const STORAGE_KEY = "garden_guru_organization_plan";
const CHANGE_EVENT = "garden-guru-plan-change";
const validTier = (value: string | null): value is PlanTier =>
  value === "free" || value === "pro" || value === "promax";

export function useOrganizationPlan() {
  const [tier, setTier] = useState<PlanTier>("pro");
  useEffect(() => {
    const sync = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (validTier(saved)) setTier(saved);
    };
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    return () => window.removeEventListener(CHANGE_EVENT, sync);
  }, []);
  const changeTier = (next: PlanTier) => {
    setTier(next);
    localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };
  return { tier, changeTier };
}
