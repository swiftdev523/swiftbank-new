import React, { useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  useOptimizedAnimation,
  useMobileViewport,
} from "../hooks/usePerformance";
import Navigation from "../components/landing/Navigation";
import HeroSection from "../components/landing/HeroSection";
import StatsSection from "../components/landing/StatsSection";
import AboutSection from "../components/landing/AboutSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import TechnologyShowcase from "../components/landing/TechnologyShowcase";
import CallToActionSection from "../components/landing/CallToActionSection";
import PremiumCardsSection from "../components/landing/PremiumCardsSection";
import Footer from "../components/landing/Footer";
import clbg2 from "../assets/images/clbg2.jpg";

const LandingPage = () => {
  const heroRef = useRef(null);
  const { canAnimate, isMobile } = useOptimizedAnimation();
  const { viewportWidth } = useMobileViewport();

  useEffect(() => {
    // Component initialization setup
  }, []);
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${clbg2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-900/90"></div>

      {/* Background animated shapes - Optimized for Mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-xl"
          animate={
            canAnimate && !isMobile
              ? {
                  y: [0, 15, 0],
                }
              : {}
          }
          transition={{
            duration: 8,
            repeat: canAnimate && !isMobile ? Infinity : 0,
            ease: "easeInOut",
          }}
          style={{
            transform: "translate3d(0, 0, 0)",
            willChange: canAnimate && !isMobile ? "transform" : "auto",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-xl"
          animate={
            canAnimate && !isMobile
              ? {
                  y: [0, -12, 0],
                }
              : {}
          }
          transition={{
            duration: 10,
            repeat: canAnimate && !isMobile ? Infinity : 0,
            ease: "easeInOut",
            delay: 1,
          }}
          style={{
            transform: "translate3d(0, 0, 0)",
            willChange: canAnimate && !isMobile ? "transform" : "auto",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-xl"
          animate={
            canAnimate && !isMobile
              ? {
                  y: [0, 18, 0],
                }
              : {}
          }
          transition={{
            duration: 9,
            repeat: canAnimate && !isMobile ? Infinity : 0,
            ease: "easeInOut",
            delay: 2,
          }}
          style={{
            transform: "translate3d(0, 0, 0)",
            willChange: canAnimate && !isMobile ? "transform" : "auto",
          }}
        />
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <div ref={heroRef}>
        <HeroSection heroRef={heroRef} />
      </div>

      {/* Stats Section */}
      <StatsSection />

      {/* About Section */}
      <AboutSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Banking Technology Showcase */}
      <TechnologyShowcase />

      {/* CTA Section */}
      <CallToActionSection />

      {/* Premium Banking Cards Section */}
      <PremiumCardsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
