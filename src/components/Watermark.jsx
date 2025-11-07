import React from "react";

const Watermark = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Multiple watermark instances for full coverage */}
      <div className="absolute inset-0 opacity-5">
        {/* Create a grid pattern of watermarks */}
        {Array.from({ length: 8 }).map((_, rowIndex) =>
          Array.from({ length: 6 }).map((_, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="absolute transform -rotate-45 select-none"
              style={{
                left: `${colIndex * 25 - 10}%`,
                top: `${rowIndex * 20 - 10}%`,
                fontSize: "clamp(1rem, 2.5vw, 2rem)",
                fontWeight: "600",
                color: "#1f2937",
                fontFamily: "system-ui, -apple-system, sans-serif",
                whiteSpace: "nowrap",
                letterSpacing: "0.05em",
              }}>
              Not Finished Yet. Signed, Swift
            </div>
          ))
        )}
      </div>

      {/* Additional layer for mobile devices */}
      <div className="absolute inset-0 opacity-3 md:hidden">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={`mobile-${index}`}
            className="absolute transform -rotate-45 select-none"
            style={{
              left: `${(index % 4) * 30 - 5}%`,
              top: `${Math.floor(index / 4) * 25 + 5}%`,
              fontSize: "clamp(0.8rem, 4vw, 1.5rem)",
              fontWeight: "600",
              color: "#374151",
              fontFamily: "system-ui, -apple-system, sans-serif",
              whiteSpace: "nowrap",
              letterSpacing: "0.05em",
            }}>
            Not Finished Yet. Signed, Swift
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watermark;
