import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
const StatusPieChart = ({ data, total }) => (<>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
          {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color}/>))}
        </Pie>
        <Tooltip formatter={(value, name) => [value, name]} contentStyle={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }}/>
      </PieChart>
    </ResponsiveContainer>
    <div className="mt-4 space-y-2">
      {data.map((item, index) => (<div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}/>
            <span className="text-sm text-gray-600">{item.name}</span>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {item.value} ({Math.round((item.value / (total || 1)) * 100)}%)
          </span>
        </div>))}
    </div>
  </>);
export default StatusPieChart;
