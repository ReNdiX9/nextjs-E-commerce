import { getBlockedProducts } from "@/actions/userAddBlockActions";

import BlockedProductsTable from "./BlockedProductsList";

export default async function BlockedItems() {
  const { products, error } = await getBlockedProducts();

  //error handing
  if (error) {
    console.error("Error fetching blocked products:", error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }
  //if no items blocked
  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary">You have not blocked any items.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen min-w-screen bg-background py-8">
      <div className=" mx-auto px-8">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Blocked Products</h1>
        <BlockedProductsTable products={products} />
      </div>
    </div>
  );
}
