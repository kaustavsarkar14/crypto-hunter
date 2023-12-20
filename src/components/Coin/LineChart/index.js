import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { convertNumbers } from '../../../functions/convertNumbers';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);



export default function LineChart({ chartData, multiAxis }) {
    console.log(chartData)
    const options = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,

        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                ticks: {
                    callback: function (val, index) {
                        return "$" + (val < 100000 ? val.toLocaleString() : convertNumbers(val));
                    },
                }
            },
            y1: multiAxis && {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
                ticks: {
                    callback: function (val, index) {
                        return "$" + (val < 100000 ? val.toLocaleString() : convertNumbers(val));
                    },
                }
            },
        },
    };

    return <Line options={options} data={chartData} />;
}
