"use client";

import React from "react";
import { Line } from "react-chartjs-2";

interface LineChartProps {
  chartData: any;
  className?: string;
  options?: any;
}
const LineChart: React.FC<LineChartProps> = ({ chartData, options, className }) => {
  return <Line data={chartData} options={options} className={className} />;
};

export default LineChart;
