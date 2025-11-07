import React from "react";

const HeroImageSection = () => {
  return (
    <div className="mt-20 container mx-auto px-4">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
          alt="Modern banking and financial services"
          className="w-full h-64 md:h-80 lg:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex items-center">
          <div className="max-w-2xl mx-auto px-8 text-center lg:text-left">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Banking Excellence Since 2010
            </h3>
            <p className="text-xl text-blue-100">
              Trusted by over 250,000 customers worldwide for secure, innovative
              financial solutions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroImageSection;
