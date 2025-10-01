import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AircraftTypeData {
    name: string;
    value: number;
}

interface AircraftTypePieChartProps {
    data: AircraftTypeData[];
}

const COLORS: { [key: string]: string } = {
    BLA: '#0ea5e9',  // sky-500
    AER: '#84cc16',  // lime-500
    SHAR: '#f97316', // orange-500
    OTHER: '#a855f7' // purple-500
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="font-bold text-white">{`${payload[0].name}`}</p>
          <p className="text-sky-300">{`Полеты: ${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
};


const AircraftTypePieChart: React.FC<AircraftTypePieChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-400">Нет данных для отображения.</div>
    }
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6b7280'} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} wrapperStyle={{fontSize: "12px"}}/>
            </PieChart>
        </ResponsiveContainer>
    );
};

export default AircraftTypePieChart;