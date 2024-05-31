
import Product from './Product';

function Products() {

  let products = [
    { 
        title:"Arqitel", 
        description: "With a continuous 3D animation, we showcase Arqitel approach and show how migration data translates into real estate.", 
        live:true, 
        case:false 
    },
    { 
        title:"Singularity", 
        description: "We immersed ourselves in a 3D world we created to explain how Cula's platform collects data from carbon removal processes and converts them into carbon credit certificates.", 
        live:true, 
        case:false
    },
    { 
        title:"Ghost", 
        description: "We've created an interactive site using generative AI to allow users to engage with our thinking about Ai, industry trends and design.", 
        live:true, 
        case:true
    },
    { 
        title:"Recon", 
        description: "A global early-stage venture fund partnering with founders to advance cleaner, safer, and more sustainable movement of people and goods.", 
        live:true, 
        case:false 
    },
    { 
        title:"Sovereign", 
        description: "We designed and developed a magical gaming experience made in Webflow to promote the translation service and their sponsorship of the 2022 Webflow Conference.", 
        live:true, 
        case:true
    },
    
];

  return (
    <div>  
        {products.map(product =>  <Product val={product}/> )}
    </div>
  )
}

export default Products