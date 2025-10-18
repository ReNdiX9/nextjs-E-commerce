"use client";

import Grid from "@mui/material/Grid";
import Item from "@/components/Item";

export default function ProductsGrid({ products }) {
  return (
    <Grid container spacing={3} justifyContent="center">
      {products.map((p) => (
        <Grid key={p._id} item xs={12} sm={6} md={4} lg={3}>
          <Item
            _id={p._id}
            title={p.title}
            condition={p.condition}
            description={p.description}
            category={p.category}
            images={p.images}
            price={p.price}
          />
        </Grid>
      ))}
    </Grid>
  );
}
