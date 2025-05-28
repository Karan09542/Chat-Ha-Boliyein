"use client";

import React from "react";
import { Pie } from "react-chartjs-2";

interface PieChartProps {
  chartData: any;
  className?: string;
  options?: any;
}
const PieChart: React.FC<PieChartProps> = ({
  chartData,
  options,
  className,
}) => {
  return <Pie data={chartData} options={options} className={className} />;
};

export default PieChart;
