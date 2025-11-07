import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

const AnimatedCounter = ({ value, label, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        let start = 0;
        const end = parseInt(value);
        const duration = 2000; // 2 seconds
        const increment = end / (duration / 16); // 60fps

        const counter = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(counter);
          } else {
            setCount(Math.ceil(start));
          }
        }, 16);

        return () => clearInterval(counter);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isInView, value, delay]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-bold text-white mb-2">
        {count.toLocaleString()}
      </div>
      <div className="text-blue-300">{label}</div>
    </div>
  );
};

const StatsSection = () => {
  return (
    <motion.section
      className="relative z-10 py-20 bg-white/5 backdrop-blur-sm"
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatedCounter value="138200" label="Active Users" delay={200} />
          <AnimatedCounter value="15" label="Years of Trust" delay={400} />
          <AnimatedCounter value="100" label="Uptime %" delay={600} />
          <AnimatedCounter value="50" label="Countries" delay={800} />
        </div>
      </div>
    </motion.section>
  );
};

export default StatsSection;
