import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RegionData } from '../types';

interface RegionBarChartProps {
    data: RegionData[];
}

const RegionBarChart: React.FC<RegionBarChartProps> = ({ data }) => {
    // Sort descending to show top regions first, then slice
    const chartData = [...data]
        .sort((a, b) => b.flights - a.flights)
        .slice(0, 10);
    
    // Function to abbreviate long region names for the X-axis
    const formatXAxisTick = (value: string) => {
        const shorterValue = value.replace(' область', ' обл.').replace('Республика ', 'Р. ');
        if (shorterValue.length > 20) {
            return shorterValue.substring(0, 18) + '...';
        }
        return shorterValue;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart 
                data={chartData} 
                margin={{ top: 20, right: 30, left: 0, bottom: 80 }} // Increased bottom margin for rotated labels
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    interval={0} // Show all labels
                    tickFormatter={formatXAxisTick}
                />
                <YAxis stroke="#9CA3AF" allowDecimals={false} />
                <Tooltip 
                    cursor={{fill: 'rgba(14, 165, 233, 0.1)'}}
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F9FAFB' }}
                />
                <Legend verticalAlign="top" wrapperStyle={{ top: -4 }}/>
                <Bar dataKey="flights" name="Кол-во полетов" fill="#0ea5e9" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default RegionBarChart;
