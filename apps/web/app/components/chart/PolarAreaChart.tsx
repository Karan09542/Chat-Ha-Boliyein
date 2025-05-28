"use client";

import React from "react";
import { PolarArea } from "react-chartjs-2";

interface PolarAreaChartProps {
  chartData: any;
    className?: string;
  options?: any;
}
const PolarAreaChart: React.FC<PolarAreaChartProps> = ({ chartData, className, options }) => {
  return (
    <PolarArea
      data={chartData}
      className={className}
      options={options}
    />
  );
};

export default PolarAreaChart;
