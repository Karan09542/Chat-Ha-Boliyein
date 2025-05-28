"use client";

import React from "react";
import { Doughnut } from "react-chartjs-2";

interface DoughnutChartProps {
  chartData: any;
  className?: string;
  options?: any;
}
const DoughnutChart: React.FC<DoughnutChartProps> = ({
  chartData,
  options,
  className,
}) => {
  return <Doughnut data={chartData} options={options} className={className} />;
};

export default DoughnutChart;
