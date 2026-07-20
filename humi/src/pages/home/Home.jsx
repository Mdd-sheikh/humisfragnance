import React from 'react'
import Hero from '../../sections/herosection/Hero'
import FAQAccordion from '../../sections/faqsection/Faqaccordion'
import './Home.css'
import FragranceHero from '../../sections/fragance/FragnanceHero'
import Insights from '../../sections/insights/Insights'
import ShopByUse from '../../sections/shopbyuse/Shopbyuse'
import ProductGrid from '../../sections/products/Productgrid'

const Home = () => {
  return (
    <div className='home-section'>
      <div className="hero-sec">
        <Hero/>
      </div>
      <div className="shopbyuse-section">
        <ShopByUse/>
      </div>
      <div className="products-display">
        <ProductGrid/>
      </div>
      <div className="insign-section">
        <Insights/>
      </div>
      <div className="fragnace-section">
        <FragranceHero/>
      </div>
      <div className="faq-section">

        <FAQAccordion/>

      </div>
    </div>
  )
}

export default Home