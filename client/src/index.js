import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from "./reportWebVitals";
import {ChakraProvider} from '@chakra-ui/react' 
// import './fonts/Gilroy-ExtraBold.otf'

ReactDOM.render( 
  <ChakraProvider>
<App /> 
 </ChakraProvider> 

,
  document.getElementById('root')
);
reportWebVitals();
 