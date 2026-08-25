import "./Footer.css";
import {
    FaInstagram,
    FaFacebookF,
    FaWhatsapp,
} from "react-icons/fa";
import { Assets } from "../../assets/Assests";

function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer__container">

                <div className="footer__brand">
                    <img src={Assets.logo} alt="Humi's Logo" />

                    <p className="footer__tagline">Humi's Parfums is a fragrance brand that offers a wide range of high-quality perfumes.</p>
                    <span className="footer__subtext">Since 2025</span>

                   
                </div>


                <div className="footer__links">

                    <div className="footer__column">
                        <h4>Collections</h4>

                        <a href="/">New Arrivals</a>
                        <a href="/">Best Sellers</a>
                        <a href="/">Gift Concierge</a>
                        <a href="/">Limited Editions</a>
                    </div>

                    <div className="footer__column">
                        <h4>Boutique</h4>

                        <a href="/">Store Locator</a>
                        <a href="/">Our Heritage</a>
                        <a href="/">Scent Masterclass</a>
                        <a href="/">Contact Us</a>
                    </div>

                    <div className="footer__column footer__connect">
                        <h4>Connect</h4>

                        <div className="footer__socials">
                            <a href="/">
                                <FaInstagram />
                            </a>

                            <a href="/">
                                <FaFacebookF />
                            </a>

                            <a href="/">
                                <FaWhatsapp />
                            </a>
                        </div>
                    </div>

                </div>

            </div>

            <div className="footer__bottom">
                <p>© {year} Humi's PARFUMS. ALL RIGHTS RESERVED.</p>

                <div className="footer__legal">
                    <a href="/">Privacy</a>
                    <a href="/">Terms</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;