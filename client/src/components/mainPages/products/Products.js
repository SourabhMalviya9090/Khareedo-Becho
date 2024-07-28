import React, { useContext, useEffect, useState } from "react";
import { GlobalState } from "../../../globalState";
import ProductItem from "../utils/product_item/ProductItem";
import { Container } from "../utils/loading/Loading";
import Filter from "../utils/filters/Filter";
import ImageSlider from "../utils/slider/Slider";
import { SliderData } from "../utils/slider/SliderData";
import Load from "../utils/load_more/Load";
import Modal from "../utils/modal/Modal";
import { Heading, Box, SimpleGrid, Text } from '@chakra-ui/react';
import { motion } from "framer-motion";

const Category = ({ name }) => (
  <Box 
    padding="10px" 
    borderRadius="md" 
    borderWidth="1px" 
    borderColor="gray.200" 
    textAlign="center" 
    as={motion.div}
    whileHover={{ scale: 1.1 }}
    cursor="pointer"
  >
    <Text fontWeight="bold">{name}</Text>
  </Box>
);



export default function Products() {
  const state = useContext(GlobalState);
  const [products] = state.productsAPI.products;
  const [token] = state.token;
  const [callback, setCallback] = state.productsAPI.callback;
  const [adCallback, setAdCallback] = state.adAPI.adCallback;
  const [loading, setloading] = state.productsAPI.loading;
  const [openModal, setOpenModal] = useState(false);
  const [featuredProducts,setFeaturedProducts] = useState([]);
  
  const [categories] = useState(["Electronics", "Clothing", "Books", "Toys", "Beauty", "Sports"]);

  const getFeaturedProducts = async()=>{
    const res = await fetch("/featuredProducts",{
      method: "GET",
      headers:{
        "Content-Type": "application/json"
      }
    });

    const response  = await res.json();
    setFeaturedProducts(response.featured_products);
    console.log(response.featured_products);


  }

  useEffect(()=>{
    getFeaturedProducts();
  },[]);

  return (
    <>
      <Filter />
      <ImageSlider SliderData={SliderData} />
      {loading ? (
        <Container />
      ) : (
        <div>
          <Heading textAlign="center" marginTop="40px" fontSize="2rem" marginBottom="30px" fontWeight="bold">
           # Categories
          </Heading>
          <SimpleGrid columns={[2, null, 3]} spacingX="100px" spacingY="20px" marginBottom="40px">
            {categories.map((category) => (
              <Category key={category} name={category}  />
            ))}
          </SimpleGrid>

          <Heading textAlign="center" marginTop='40px' fontSize='2rem' marginBottom='20px' fontWeight='bold'>
            # Featured Products
          </Heading>
          <div className="products">
            {featuredProducts.map(({product}) => (
              <ProductItem
                key={product._id}
                product={product}
                token={token}
                callback={callback}
                setCallback={setCallback}
              />
            ))}
          </div>
        </div>
      )}
      <Load />
    </>
  );
}
