import React, { useState, useEffect } from "react";
import {
  FaInfoCircle,
  FaChartLine,
  FaCalendarAlt,
  FaBell,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

const CreditScoreWidget = ({ user }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Mock credit data - in real app this would come from credit bureau APIs
  const creditData = {
    currentScore: 742,
    previousScore: 738,
    scoreRange: { min: 300, max: 850 },
    lastUpdated: "2025-09-15",
    trend: "up",
    factors: [
      { name: "Payment History", impact: "positive", percentage: 35 },
      { name: "Credit Utilization", impact: "good", percentage: 30 },
      { name: "Length of History", impact: "excellent", percentage: 15 },
      { name: "Credit Mix", impact: "good", percentage: 10 },
      { name: "New Credit", impact: "neutral", percentage: 10 },
    ],
    recommendations: [
      "Keep credit utilization below 30%",
      "Continue making on-time payments",
      "Consider increasing credit limit",
    ],
    alerts: {
      hasNewReport: true,
      hasScoreChange: true,
      hasRecommendations: true,
    },
  };

  const scoreDifference = creditData.currentScore - creditData.previousScore;
  const scorePercentage =
    ((creditData.currentScore - creditData.scoreRange.min) /
      (creditData.scoreRange.max - creditData.scoreRange.min)) *
    100;

  // Animate score counter
  useEffect(() => {
    const duration = 2000;
    const increment = creditData.currentScore / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= creditData.currentScore) {
        current = creditData.currentScore;
        clearInterval(timer);
      }
      setAnimatedScore(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [creditData.currentScore]);

  const getScoreGrade = (score) => {
    if (score >= 800)
      return { grade: "Excellent", color: "green", bgColor: "green-50" };
    if (score >= 740)
      return { grade: "Very Good", color: "blue", bgColor: "blue-50" };
    if (score >= 670)
      return { grade: "Good", color: "indigo", bgColor: "indigo-50" };
    if (score >= 580)
      return { grade: "Fair", color: "yellow", bgColor: "yellow-50" };
    return { grade: "Poor", color: "red", bgColor: "red-50" };
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case "positive":
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "neutral":
        return "text-gray-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const scoreGrade = getScoreGrade(creditData.currentScore);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full bg-${scoreGrade.color}-100 flex items-center justify-center`}>
            <FaChartLine className={`w-5 h-5 text-${scoreGrade.color}-600`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Credit Score</h3>
            <p className="text-sm text-gray-500">FICO® Score 8</p>
          </div>
        </div>

        {/* Alerts */}
        {Object.values(creditData.alerts).some((alert) => alert) && (
          <div className="flex items-center space-x-1">
            <FaBell className="w-4 h-4 text-blue-600" />
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              Updates
            </span>
          </div>
        )}
      </div>

      {/* Score Display */}
      <div className="text-center mb-6">
        <div className="relative">
          <div
            className={`text-4xl font-bold text-${scoreGrade.color}-600 mb-2`}>
            {animatedScore}
          </div>
          <div
            className={`text-sm font-medium text-${scoreGrade.color}-600 mb-2`}>
            {scoreGrade.grade}
          </div>

          {/* Score Change */}
          <div className="flex items-center justify-center space-x-1">
            {scoreDifference > 0 ? (
              <FaArrowUp className="w-3 h-3 text-green-600" />
            ) : scoreDifference < 0 ? (
              <FaArrowDown className="w-3 h-3 text-red-600" />
            ) : null}
            <span
              className={`text-sm font-medium ${
                scoreDifference > 0
                  ? "text-green-600"
                  : scoreDifference < 0
                    ? "text-red-600"
                    : "text-gray-600"
              }`}>
              {scoreDifference > 0 ? "+" : ""}
              {scoreDifference} this month
            </span>
          </div>
        </div>

        {/* Score Range Indicator */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`bg-gradient-to-r from-${scoreGrade.color}-400 to-${scoreGrade.color}-600 h-2 rounded-full transition-all duration-1000`}
              style={{ width: `${scorePercentage}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{creditData.scoreRange.min}</span>
            <span>{creditData.scoreRange.max}</span>
          </div>
        </div>
      </div>

      {/* Credit Factors */}
      {showDetails && (
        <div className="space-y-3 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Score Factors
          </h4>
          {creditData.factors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${getImpactColor(factor.impact).replace("text-", "bg-")}`}></div>
                <span className="text-sm text-gray-700">{factor.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {factor.percentage}%
                </span>
                <span
                  className={`text-xs capitalize ${getImpactColor(factor.impact)}`}>
                  {factor.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {showDetails && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Recommendations
          </h4>
          <div className="space-y-2">
            {creditData.recommendations.slice(0, 2).map((rec, index) => (
              <div key={index} className="flex items-start space-x-2">
                <FaInfoCircle className="w-3 h-3 text-blue-600 mt-0.5" />
                <span className="text-xs text-gray-600">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors text-sm">
          {showDetails ? "Show Less" : "View Details"}
        </button>

        {showDetails && (
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm cursor-pointer">
            Get Full Credit Report
          </button>
        )}
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <FaCalendarAlt className="w-3 h-3" />
          <span>Updated {creditData.lastUpdated}</span>
        </div>
        <span>Free Weekly Updates</span>
      </div>
    </div>
  );
};

export default CreditScoreWidget;
