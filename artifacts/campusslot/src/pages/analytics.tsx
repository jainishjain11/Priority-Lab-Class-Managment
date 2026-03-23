import { useGetAnalyticsOverview, useGetUtilizationData } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react";

export default function Analytics() {
  const { data: overview, isLoading: overviewLoading } = useGetAnalyticsOverview();
  const { data: utilization, isLoading: utilLoading } = useGetUtilizationData();

  const getUtilizationColor = (percent: number) => {
    if (percent > 80) return "hsl(0, 84%, 60%)"; // destructive/red
    if (percent > 60) return "hsl(32, 95%, 50%)"; // amber
    return "hsl(142, 71%, 45%)"; // emerald
  };

  const priorityData = overview ? [
    { name: 'P1 Drives', value: overview.p1Count, fill: 'hsl(0, 84%, 60%)' },
    { name: 'P2 Exams', value: overview.p2Count, fill: 'hsl(32, 95%, 50%)' },
    { name: 'P3 Classes', value: overview.p3Count, fill: 'hsl(142, 71%, 45%)' },
  ] : [];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary text-primary-foreground rounded-xl shadow-lg">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">System Analytics</h1>
          <p className="text-muted-foreground">Usage metrics and performance data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Utilization Chart */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border">
          <CardHeader>
            <CardTitle>Lab Utilization Rates</CardTitle>
            <CardDescription>Current week percentage capacity utilization per lab</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              {utilLoading ? (
                <div className="w-full h-full flex justify-center items-center bg-muted/20 rounded-xl"><span className="animate-pulse">Loading chart data...</span></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={utilization} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="labName" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                      contentStyle={{borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}
                    />
                    <Bar dataKey="utilizationPercent" name="Utilization %" radius={[6, 6, 0, 0]}>
                      {utilization?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getUtilizationColor(entry.utilizationPercent)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Good (&lt;60%)</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Moderate (60-80%)</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><div className="w-3 h-3 rounded-full bg-red-500"></div> High (&gt;80%)</div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="shadow-sm border-border flex flex-col">
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Ratio of bookings by priority tier</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {overviewLoading ? (
              <div className="w-full h-[250px] flex justify-center items-center bg-muted/20 rounded-xl"><span className="animate-pulse">Loading...</span></div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="bg-muted/40 rounded-xl p-4 mt-6">
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Key Insight
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                P1 bookings account for <strong className="text-foreground">
                  {overview ? Math.round((overview.p1Count / overview.totalBookings) * 100) : 0}%
                </strong> of all lab reservations this week, resulting in {overview?.totalDisplacements} displaced sessions.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Peak Hours */}
        <Card className="col-span-1 lg:col-span-3 shadow-sm border-border">
          <CardHeader>
            <CardTitle>Peak Usage Hours</CardTitle>
            <CardDescription>Aggregate booking counts across all labs throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {overviewLoading ? (
                <div className="w-full h-full flex justify-center items-center"><span className="animate-pulse">Loading...</span></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview?.peakHours} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                      contentStyle={{borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}
                    />
                    <Bar dataKey="count" name="Total Bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
