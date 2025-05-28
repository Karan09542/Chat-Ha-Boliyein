"use client";

import React from "react";
import { Bar } from "react-chartjs-2";

interface BarChartProps {
  chartData: any;
  className?: string;
  options?: any;
}
const BarChart: React.FC<BarChartProps> = ({
  chartData,
  className,
  options,
}) => {
  return <Bar data={chartData} options={options} className={className} />;
};

export default BarChart;
