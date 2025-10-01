import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AltitudeLayerData } from '../types';

interface AltitudeChartProps {
    data: AltitudeLayerData[];
}

const COLORS = {
    BLA: '#0ea5e9',  // sky-500
    AER: '#84cc16',  // lime-500
    SHAR: '#f97316', // orange-500
    OTHER: '#a855f7' // purple-500
};

const AltitudeChart: React.FC<AltitudeChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                    cursor={{fill: 'rgba(14, 165, 233, 0.1)'}}
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F9FAFB' }}
                />
                <Legend />
                <Bar dataKey="BLA" stackId="a" fill={COLORS.BLA} name="Беспилотные ЛА (BLA)" />
                <Bar dataKey="AER" stackId="a" fill={COLORS.AER} name="Аэростаты (AER)" />
                <Bar dataKey="SHAR" stackId="a" fill={COLORS.SHAR} name="Шары (SHAR)" />
                <Bar dataKey="OTHER" stackId="a" fill={COLORS.OTHER} name="Прочие" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default AltitudeChart;
