"use client";

import Grid from "@mui/material/Grid";
import Item from "@/components/Item";

export default function ProductsGrid({ products }) {
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
          />
        </Grid>
      ))}
    </Grid>
  );
}
