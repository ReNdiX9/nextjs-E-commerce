"use client";

import Grid from "@mui/material/Grid";
import Item from "@/components/Item";

export default function ProductsGrid({ products }) {
  return (
    <Grid container spacing={3} justifyContent="center">
      {products.map((product) => (
        <Grid key={product._id} item xs={12} sm={6} md={4} lg={3}>
          <Item
            _id={product._id}
            title={product.title}
            condition={product.condition}
            category={product.category}
            images={product.images}
            price={product.price}
          />
        </Grid>
      ))}
    </Grid>
  );
}
