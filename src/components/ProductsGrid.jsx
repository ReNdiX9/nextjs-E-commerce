"use client";

import Grid from "@mui/material/Grid";
import Item from "@/components/Item";
import { useRouter } from "next/navigation";

export default function ProductsGrid({ products }) {
  const router = useRouter();

  return (
    <Grid container spacing={3} justifyContent="center">
      {products.map((p) => (
        <Grid key={p.id} item xs={12} sm={6} md={4} lg={3}>
          <Item
            id={p.id}
            title={p.title}
            description={p.description}
            category={p.category}
            image={p.image}
            price={p.price}
          // onAddToCart={() => handleAdd(p)}
          />
        </Grid>
      ))}
    </Grid>
  );
}
