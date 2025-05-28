"use client";
import React from "react";
import { Line } from "react-chartjs-2";


interface SinChartProps {
 chartData: any
}

// Generate X and Y points for sin(x)
const generateSinData = (a: number, b: number, c: number, d: number) => {
  const labels: string[] = [];
  const data: number[] = [];

  const step = (2 * Math.PI) / 100;
  for (let x = 0; x <= 2 * Math.PI; x += step) {
    labels.push(x.toFixed(2));
    const y = a * Math.sin(b * x + c) + d;
    data.push(y);
  }

  return { labels, data };
};
const SinChart: React.FC<SinChartProps> = ({ chartData }) => {
//   const { labels, data } = generateSinData(a, b, c, d);

//   const chartData = {
//     labels,
//     datasets: [
//       {
//         label: `y = ${a}·sin(${b}x + ${c}) + ${d}`,
//         data,
//         borderColor: [
//             "rgba(255, 99, 132, 1)",    // Red
//             "rgba(54, 162, 235, 1)",    // Blue
//             "rgba(255, 206, 86, 1)",    // Yellow
//             "rgba(75, 192, 192, 1)",    // Teal
//             "rgba(153, 102, 255, 1)",   // Purple
//             "rgba(255, 159, 64, 1)",    // Orange
//         ],
//         borderWidth: 1,
//         tension: 0.25,
//         fill: true,
//       },
//     ],
//   };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        // text: `Graph: y = ${a}·sin(${b}x + ${c}) + ${d}`,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "x (radians)",
        },
      },
      y: {
        title: {
          display: true,
          text: "y",
        },
      },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
};

export default SinChart;
