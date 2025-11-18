// app/blocked/page.js
import { getBlockedProductIds } from "@/actions/userAddBlockActions";
import BlockedProductsList from "@/components/BlockedItems";

export default async function BlockedProductsPage() {
  const products = await getBlockedProductIds();

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Blocked Products</h1>
      <BlockedProductsList products={products} />
    </div>
  );
}
