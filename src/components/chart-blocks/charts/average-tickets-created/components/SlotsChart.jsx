"use client";
import React, { useState, useEffect } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, ReferenceLine, } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Loader2 } from "lucide-react";
import schoolService from "@/services/schools";
import classService from "@/services/class";
import studentService from "@/services/students";
// School colors for consistency
const schoolColors = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"
];
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && label) {
        return (<div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-gray-900 mb-3">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (<div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}/>
                <span className="text-sm text-gray-600">{entry.name}:</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}%
              </span>
            </div>))}
        </div>
      </div>);
    }
    return null;
};
// Summary card component
const SchoolSummaryCard = ({ school_name, total_slots, used_slots, available_slots, utilization_rate, color, classes }) => {
    const getStatusInfo = (rate, overbooked) => {
        if (overbooked)
            return { status: "overbooked", icon: AlertTriangle, color: "text-red-700 bg-red-100" };
        if (rate >= 90)
            return { status: "critical", icon: AlertTriangle, color: "text-red-600 bg-red-50" };
        if (rate >= 75)
            return { status: "high", icon: TrendingUp, color: "text-orange-600 bg-orange-50" };
        if (rate >= 50)
            return { status: "moderate", icon: TrendingUp, color: "text-blue-600 bg-blue-50" };
        return { status: "low", icon: TrendingDown, color: "text-green-600 bg-green-50" };
    };
    const overbooked = used_slots > total_slots;
    const statusInfo = getStatusInfo(utilization_rate, overbooked);
    const StatusIcon = statusInfo.icon;
    return (<div className=" dark::bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold  truncate">{school_name}</h4>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
          <StatusIcon className="h-3 w-3"/>
          <span>{utilization_rate.toFixed(1)}%</span>
        </div>
      </div>
      {used_slots > total_slots && (<p className="text-sm text-red-600 mt-2">
    ⚠ Overbooked: More students than slots
  </p>)}

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Capacity</span>
          <span className="font-medium text-gray-900">{used_slots}/{total_slots}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="h-2 rounded-full transition-all duration-300" style={{
            width: `${Math.min(utilization_rate, 100)}%`,
            backgroundColor: color
        }}/>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{classes.length} classes</span>
          <span>{available_slots} available</span>
        </div>
      </div>
    </div>);
};
export default function SlotsChart() {
    var _a;
    const [chartType, setChartType] = useState('line');
    const [timeRange, setTimeRange] = useState('30d');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [schoolSlotData, setSchoolSlotData] = useState([]);
    const [timeSeriesData, setTimeSeriesData] = useState([]);
    // Fetch real data from APIs
    const fetchSlotData = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch all schools, classes, and students
            const [schools, classes, students] = await Promise.all([
                schoolService.getAll(),
                classService.getAll(),
                studentService.getAll()
            ]);
            // Group classes by school
            const schoolClassMap = new Map();
            classes.forEach(cls => {
                if (!schoolClassMap.has(cls.school_id)) {
                    schoolClassMap.set(cls.school_id, []);
                }
                schoolClassMap.get(cls.school_id).push(cls);
            });
            // Count enrolled students per class
            const classStudentCount = new Map();
            students.forEach((student) => {
                if (student.class_id && student.admission_status === 'admitted') {
                    classStudentCount.set(student.class_id, (classStudentCount.get(student.class_id) || 0) + 1);
                }
            });
            // Calculate slot data for each school
            const slotData = schools.map(school => {
                const schoolClasses = schoolClassMap.get(school.id) || [];
                const total_slots = schoolClasses.reduce((sum, cls) => sum + cls.slots, 0);
                const used_slots = schoolClasses.reduce((sum, cls) => {
                    return sum + (classStudentCount.get(cls.id) || 0);
                }, 0);
                const available_slots = total_slots - used_slots;
                const utilization_rate = total_slots > 0 ? (used_slots / total_slots) * 100 : 0;
                return {
                    school_id: school.id,
                    school_name: school.name,
                    total_slots,
                    used_slots,
                    available_slots,
                    utilization_rate,
                    classes: schoolClasses
                };
            }); // Only include schools with classes
            setSchoolSlotData(slotData);
            // Generate time series data (simulated historical data for now)
            // In a real implementation, you'd store historical utilization data
            const timeData = generateHistoricalData(slotData);
            setTimeSeriesData(timeData);
        }
        catch (err) {
            console.error('Error fetching slot data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch slot data');
        }
        finally {
            setLoading(false);
        }
    };
    // Generate simulated historical data based on current utilization
    const generateHistoricalData = (currentData) => {
        const days = 30;
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const point = {
                date: date.toISOString().split('T')[0],
                displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            };
            // Add simulated historical data for each school
            currentData.forEach(school => {
                // Simulate some variance around current utilization
                const variance = (Math.random() - 0.5) * 20; // ±10% variance
                const historicalRate = Math.max(0, Math.min(100, school.utilization_rate + variance));
                point[school.school_name] = historicalRate;
            });
            data.push(point);
        }
        return data;
    };
    useEffect(() => {
        fetchSlotData();
    }, [timeRange]);
    // Calculate average utilization
    const avgUtilization = schoolSlotData.length > 0
        ? schoolSlotData.reduce((sum, school) => sum + school.utilization_rate, 0) / schoolSlotData.length
        : 0;
    // Get school colors
    const getSchoolColor = (index) => schoolColors[index % schoolColors.length];
    if (error) {
        return (<div className="rounded-xl border shadow-sm">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600"/>
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Slot Data</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>);
    }
    return (<div className="rounded-xl border shadow-sm">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">School Capacity Utilization</h3>
            <p className="text-sm text-gray-600">
              Real-time slot availability and utilization trends across schools
            </p>
          </div>
          <div className="flex items-center gap-3">
          <button onClick={fetchSlotData} className="px-4 py-2 bg-slate-600 rounded-md border border-gray-300 text-white text-sm hover:bg-slate-600 transition">
  Refresh Data
    </button>

            <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={loading}>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
            </select>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={loading}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
        
        {/* School Summary Cards */}
        {loading ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>))}
          </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {schoolSlotData.map((school, index) => (<SchoolSummaryCard key={school.school_id} {...school} color={getSchoolColor(index)}/>))}
          </div>)}
      </div>
      
      <div className="px-6 pb-6">
        {/* Main Chart */}
        <div className="h-[400px] mb-6">
          {loading ? (<div className="h-full bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin"/>
                <span>Loading chart data...</span>
              </div>
            </div>) : (<ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (<LineChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="displayDate" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }}/>
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} label={{ value: 'Utilization (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <Legend verticalAlign="top" height={36} iconType="line" wrapperStyle={{ fontSize: '14px', color: '#6b7280' }}/>
                  {avgUtilization > 0 && (<ReferenceLine y={avgUtilization} stroke="#94a3b8" strokeDasharray="5 5" label={{ value: "Average", position: "right" }}/>)}
                  <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Capacity Alert", position: "right" }}/>
                  {schoolSlotData.map((school, index) => (<Line key={school.school_name} type="monotone" dataKey={school.school_name} stroke={getSchoolColor(index)} strokeWidth={2} dot={{ fill: getSchoolColor(index), strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: getSchoolColor(index), strokeWidth: 2 }} name={school.school_name}/>))}
                </LineChart>) : (<AreaChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="displayDate" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }}/>
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} label={{ value: 'Utilization (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <Legend verticalAlign="top" height={36} iconType="rect" wrapperStyle={{ fontSize: '14px', color: '#6b7280' }}/>
                  {avgUtilization > 0 && (<ReferenceLine y={avgUtilization} stroke="#94a3b8" strokeDasharray="5 5" label={{ value: "Average", position: "right" }}/>)}
                  <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Capacity Alert", position: "right" }}/>
                  {schoolSlotData.map((school, index) => (<Area key={school.school_name} type="monotone" dataKey={school.school_name} stroke={getSchoolColor(index)} fill={getSchoolColor(index)} fillOpacity={0.1} strokeWidth={2} name={school.school_name}/>))}
                </AreaChart>)}
            </ResponsiveContainer>)}
        </div>

        {/* Insights Section */}
        <div className="dark::bg-white rounded-lg p-4">
          <h4 className="text-sm font-semibold  mb-3">Live Capacity Insights</h4>
          {loading ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-gray-300 mt-2"/>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>))}
            </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {schoolSlotData.length > 0 && (<>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"/>
                    <div>
                      <div className="font-medium ">High Utilization</div>
                      <div className="text-gray-600">
                        {((_a = schoolSlotData.find(s => s.utilization_rate >= 80)) === null || _a === void 0 ? void 0 : _a.school_name) || 'None'} 
                        {schoolSlotData.find(s => s.utilization_rate >= 80) && ' needs attention'}
                        {!schoolSlotData.find(s => s.utilization_rate >= 80) && ' - all schools below 80%'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"/>
                    <div>
                      <div className="font-medium ">Available Capacity</div>
                      <div className="text-gray-600">
                        {schoolSlotData.reduce((sum, s) => sum + s.available_slots, 0)} total slots available
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"/>
                    <div>
                      <div className="font-medium ">Average Utilization</div>
                      <div className="text-gray-600">
                        {avgUtilization.toFixed(1)}% across all schools
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"/>
                    <div>
                      <div className="font-medium ">Total Capacity</div>
                      <div className="text-gray-600">
                        {schoolSlotData.reduce((sum, s) => sum + s.total_slots, 0)} slots across {schoolSlotData.length} schools
                      </div>
                    </div>
                  </div>
                </>)}
            </div>)}
        </div>
      </div>
    </div>);
}
