import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import EmploymentCertClient from "./EmploymentCertClient";

export const dynamic = "force-dynamic";

export default async function EmploymentCertPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <EmploymentCertClient />;
}
