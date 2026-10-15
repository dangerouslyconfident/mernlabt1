import Hero from '../components/marketing/Hero';
import Features from '../components/marketing/Features';

/**
 * Landing Page ("/")
 * Entry point for ShopKart with Apple-style aesthetic, restrained motion,
 * hero dashboard preview, and 3-card features grid.
 */
export default function Landing() {
  return (
    <div className="w-full">
      <Hero />
      <Features />
    </div>
  );
}
