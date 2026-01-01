import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";

// 根路徑重定向到預設語言
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
