import React from 'react'
import Hero from '../../sections/herosection/Hero'
import Faqaccordion from '../../sections/faqsection/Faqaccordion'
import './Home.css'
import Fragrancehero from '../../sections/fragance/Fragnancehero'
import Insights from '../../sections/insights/Insights'
import Shopbyuse from '../../sections/shopbyuse/Shopbyuse'
import ProductGrid from '../../sections/products/Productgrid'

const Home = () => {
  return (
    <div className='home-section'>
      <div className="hero-sec">
        <Hero/>
      </div>
      <div className="shopbyuse-section">
        <Shopbyuse/>
      </div>
      <div className="products-display">
        <ProductGrid/>
      </div>
      <div className="insign-section">
        <Insights/>
      </div>
      <div className="fragnace-section">
        <Fragrancehero/>
      </div>
      <div className="faq-section">

        <Faqaccordion/>

      </div>
    </div>
  )
}

export default Home