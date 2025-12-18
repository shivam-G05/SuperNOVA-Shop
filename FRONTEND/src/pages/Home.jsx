import { useEffect, useState } from "react";
import "./Home.css";
import { asyncgetproducts } from "../store/actions/productsAction";
import {asyncgetusers} from "../store/actions/userAction";
import ProductCard from '../components/ProductCard'


function Home() {
  const [welcomeText, setWelcomeText] = useState(false);

  

  const [products, setProducts] = useState([]);

  

  useEffect(() => {
    const fetchProducts = async () => {
      
      const res=await asyncgetproducts();
      setProducts(res);
    };
    fetchProducts();
    asyncgetusers()
  }, []);

  

  useEffect(() => {
    const text = "Welcome to SuperNOVA Shop.";
    let i = 0;
    const interval = setInterval(() => {
      setWelcomeText(text.substring(0, i + 1));
      i++;
      if (i === text.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
}, []);

  return (
    <div className='home-container'>
      <div className='home-page-heading'>
        <h1 className='welcome'>
          {welcomeText}
        </h1>
        
    
      </div>
      <div className='home-page-product-container'>
        <div className='home-page-products' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', padding: '24px' }}>
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
