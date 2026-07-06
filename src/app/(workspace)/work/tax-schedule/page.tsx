import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TaxScheduleClient from "./TaxScheduleClient";

export const dynamic = "force-dynamic";

export default async function TaxSchedulePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <TaxScheduleClient />;
}
