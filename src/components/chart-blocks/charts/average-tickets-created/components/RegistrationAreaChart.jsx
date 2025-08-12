import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CustomTooltip from './CustomTooltip';
const RegistrationAreaChart = ({ data }) => (<ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}/>
      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }}/>
      <Tooltip content={<CustomTooltip />}/>
      <Area type="monotone" dataKey="approved" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Approved"/>
      <Area type="monotone" dataKey="pending" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Pending"/>
      <Area type="monotone" dataKey="rejected" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Rejected"/>
    </AreaChart>
  </ResponsiveContainer>);
export default RegistrationAreaChart;
