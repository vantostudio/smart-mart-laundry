import { redirect } from "next/navigation";

/* Products is the admin home for now. The page there checks access. */
export default function Page() {
  redirect("/admin/products");
}
