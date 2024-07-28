import React, {useContext, useState } from "react";
import { GlobalState } from "../../../globalState";
import ProductItem from "../utils/product_item/ProductItem";
import Loading from "../utils/loading/Loading";
import "./MyAd.css";
import {loadStripe} from '@stripe/stripe-js';
import emailjs from '@emailjs/browser';

export default function MyAd() {
  const state = useContext(GlobalState);
  const [token] = state.token;
  const [myAd] = state.adAPI.myAd;
  const [callback, setCallback] = state.productsAPI.callback;
  const [user] = state.userAPI.user;
  const email = ()=>{
    const templateParams = {
      to_name: `${user.name}`,
      to_email: `${user.email}`,
      from_name: 'IIT Jodhpur Khareedo Becho',
      from_email: "malviyasourabh576@gmail.com",
      message: `Yeh!.. Your product has been featured on Khareedo Becho!`
    };

    emailjs.send('service_krfc3jh', 'template_njm4xd2', templateParams,"5zZnPUVTiFLWVDEyh")
    .then(function(response) {
      console.log('SUCCESS!', response.status, response.text);
    }, function(error) {
      console.log('FAILED...', error);
    });
  }
  
  const generate_email = ()=>{
    console.log("generating..");
    // console.log(product);
    email();
  }
  const makePayment = async(product)=>{
    const stripe  = await loadStripe("pk_test_51PSHvrRqGoXTbAR2JrrgE0QEvjgZUhDV9YXqYHZUpzIbsGjPFdpawKZZHxNrc3pCy6FaGMobpgrMqOIowL3Av2XS00HrwOsYZD");

    const body ={
      products: product
    }
    const headers = {
      "Content-Type": "application/json"
    }

    const response = await fetch("/createcheckoutsession",{
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    })

    const session = await response.json();
    const result  = await stripe.redirectToCheckout({
      sessionId:session.id
    })
    if(result.error){
      console.log(result.error);
    }
  }
  
  return (
    <>
      <div className="products">
        {myAd.map((product) => {
          return (
            <div className="divForFeature">
            <ProductItem
              key={product._id}
              product={product}
              token={token}
              callback={callback}
              setCallback={setCallback}
            />
            {product.isFeatured==false?<button onClick={()=>{makePayment(product)}}>FEATURE MY PRODUCT</button>: <p style={{color: "green", textAlign: "center", border: "2px solid red"}}>Featured Product</p>}
            </div>
          );
        })}
        {myAd.length === 0 && <Loading />}
      </div>
    </>
  );
}
