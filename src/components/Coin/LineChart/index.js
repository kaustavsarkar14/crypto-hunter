import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import { convertNumbers } from "../../../functions/convertNumbers";

function LineChart({ chartData, multiAxis }) {
  console.log("linechart data", chartData)
  const options = {
    plugins: {
      legend: {
        display: multiAxis ? true : false,
      },
    },
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      crypto1: {
        type: "linear",
        display: "true",
        position: "left",
        ticks: {
          callback: function (value, index, ticks) {
            return "$" + value
          }
        }
      },
      crypto2: {
        type: "linear",
        display: "true",
        position: "right",
        ticks: {
          callback: function (value, index, ticks) {
            return "$" + value
          }
        }
      }
    }
  };

  return <div style={{ padding: "1rem" }} >
    <Line data={chartData} options={options} />
  </div>
}

export default LineChart;