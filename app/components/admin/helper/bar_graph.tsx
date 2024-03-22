import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { Card } from "antd";
import { LineGraphProps } from "@/types";

Chart.register(
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler
);

const CustomGraph = ({
  title,
  graphTitle,
  color,
  prevMonth,
  prevYear,
  labels,
  data,
}: LineGraphProps) => {
  return (
    <Card hoverable>
      <label style={{ fontSize: "1.2em", fontFamily: "sans-serif" }}>
        {title}
      </label>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: title,
              data,
              borderColor: color,
              fill: true,
              backgroundColor: `${color}90`,
            },
          ],
        }}
        options={{
          responsive: true,
          hover: {
            mode: "point",
          },
          animations: {
            y: {
              easing: "easeInOutElastic",
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: graphTitle,
              font: {
                size: 20,
                family: "Abel",
              },
            },
          },
          scales: {
            y: {
              min: 0,
              max: 10,
              ticks: {
                display: false,
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
          },
        }}
        plugins={[
          {
            id: "intersectDataVerticalLine",
            beforeDraw: (chart) => {
              if (chart.getActiveElements().length) {
                const activePoint = chart.getActiveElements()[0];
                const chartArea = chart.chartArea;
                const ctx = chart.ctx;
                ctx.save();
                // grey vertical hover line - full chart height
                ctx.beginPath();
                ctx.moveTo(activePoint.element.x, chartArea.top);
                ctx.lineTo(activePoint.element.x, chartArea.bottom);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "rgba(0,0,0, 0.1)";
                ctx.stroke();
                ctx.restore();

                // colored vertical hover line - ['data point' to chart bottom] - only for charts 1 dataset
                if (chart.data.datasets.length === 1) {
                  ctx.beginPath();
                  ctx.moveTo(activePoint.element.x, activePoint.element.y);
                  ctx.lineTo(activePoint.element.x, chartArea.bottom);
                  ctx.lineWidth = 2;
                  // ctx.strokeStyle = chart.data.datasets[0].borderColor;
                  ctx.stroke();
                  ctx.restore();
                }
              }
            },
          },
        ]}
      />
      <div
        style={{ display: "flex", justifyContent: "space-between", height: 50 }}
      >
        <div>
          <label>Previous Month</label>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <span
              style={{
                fontFamily: "sans-serif",
                color: prevMonth.positive ? "#37b99c" : "#f00",
                fontWeight: "bolder",
              }}
            >
              {prevMonth.value}%
            </span>
            {prevMonth.positive ? (
              <FaChevronUp style={{ color: "#37b99c" }} />
            ) : (
              <FaChevronDown style={{ color: "#f00" }} />
            )}
          </div>
        </div>
        <div>
          <label>Previous Year</label>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <span
              style={{
                fontFamily: "sans-serif",
                color: prevYear.positive ? "#37b99c" : "#f00",
                fontWeight: "bolder",
              }}
            >
              {prevYear.value}%
            </span>
            {prevYear.positive ? (
              <FaChevronUp style={{ color: "#37b99c" }} />
            ) : (
              <FaChevronDown style={{ color: "#f00" }} />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CustomGraph;

// <Bar
//   options={{
//     responsive: true,
//     animations: {
//       y: {
//         easing: "easeInOutElastic",
//       },
//     },
//     plugins: {
//       legend: {
//         display: false,
//       },
//       title: {
//         display: true,
//         text: "Students per College",
//         position: "top",
//         font: {
//           size: 13,
//           family: "Abel",
//         },
//       },
//     },
//     scales: {
//       y: {
//         min: 0,
//         max: 10,
//         stacked: true,
//         // title: {
//         //   display: true,
//         //   text: "Student(s)",
//         //   font: {
//         //     family: "Abel",
//         //   },
//         // },
//       },
//       x: {
//         title: {
//           display: true,
//           text: "Colleges",
//           font: {
//             family: "Abel",
//           },
//         },
//       },
//     },
//   }}
//   data={{
//     labels: ["a", "b", "c", "d", "e", "f", "g"],
//     datasets: [
//       {
//         label: "My First Dataset",
//         data: [65, 59, 80, 81, 56, 55, 40],
//         backgroundColor: [
//           "rgba(255, 99, 132, 0.2)",
//           "rgba(255, 159, 64, 0.2)",
//           "rgba(255, 205, 86, 0.2)",
//           "rgba(75, 192, 192, 0.2)",
//           "rgba(54, 162, 235, 0.2)",
//           "rgba(153, 102, 255, 0.2)",
//           "rgba(201, 203, 207, 0.2)",
//         ],
//         borderColor: [
//           "rgb(255, 99, 132)",
//           "rgb(255, 159, 64)",
//           "rgb(255, 205, 86)",
//           "rgb(75, 192, 192)",
//           "rgb(54, 162, 235)",
//           "rgb(153, 102, 255)",
//           "rgb(201, 203, 207)",
//         ],
//         borderWidth: 1,
//       },
//     ],
//   }}
// />
