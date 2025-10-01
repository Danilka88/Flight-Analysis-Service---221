import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HourlyData } from '../types';

interface ActivityDistributionChartProps {
    data: HourlyData[];
}

const ActivityDistributionChart: React.FC<ActivityDistributionChartProps> = ({ data }) => {
    return (
        <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                    <XAxis dataKey="hour" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      cursor={{fill: 'rgba(14, 165, 233, 0.1)'}}
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#F9FAFB' }}
                    />
                    <Bar dataKey="flights" name="Кол-во полетов" fill="#0ea5e9" barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ActivityDistributionChart;
