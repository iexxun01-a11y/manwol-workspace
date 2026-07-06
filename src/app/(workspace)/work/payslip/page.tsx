import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PayslipClient from "./PayslipClient";

export const dynamic = "force-dynamic";

export default async function PayslipPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <PayslipClient />;
}
