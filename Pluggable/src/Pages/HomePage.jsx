import React from 'react'
import Navbar from '../component/Navbar'
import Hero from '../component/Hero'
import Stripes from '../component/Stripes'
import Products from '../component/Products'
import Marquees from '../component/Marquees'
import Cards from '../component/Cards'
import Footer from '../component/Footer'

function HomePage() {
  return (
    <div className={"w-full h-[100%] bg-zinc-900 text-white font-['satoshi'] scrollbar-hidden scrollbar-none"} style="scrollbar-width: none;"> 
        <Hero/>  
        <Stripes/>
        <Products/>
        <Marquees/>
        <Cards/>
        <Footer />
	</div>
  )
}

export default HomePage