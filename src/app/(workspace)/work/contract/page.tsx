import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ContractClient from "./ContractClient";

export const dynamic = "force-dynamic";

export default async function ContractPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <ContractClient />;
}
