"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell, Sector } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Mock data
const cloAttainmentData = [
  { clo: "CLO1", attainment: 85 },
  { clo: "CLO2", attainment: 78 },
  { clo: "CLO3", attainment: 92 },
  { clo: "CLO4", attainment: 89 },
];

const gradeDistributionData = [
  { name: "A", value: 30 },
  { name: "B", value: 40 },
  { name: "C", value: 20 },
  { name: "D", value: 10 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const studentComparisonData = [
  { name: "Student A", score: 95, rank: 1 },
  { name: "Student B", score: 88, rank: 2 },
  { name: "Student C", score: 76, rank: 3 },
  { name: "Student D", score: 92, rank: 4 },
];

const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
const clos = ["CLO1", "CLO2", "CLO3", "CLO4"];

// Generate mock heatmap data (0-100 values)
const heatmapData = clos.map(() => 
  bloomLevels.map(() => Math.floor(Math.random() * 100))
);

export default function Reports() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Reports Overview</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Navigate to Specific Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Link href="/faculty/reports/clo-attainment">
              <Button variant="outline" className="w-full">CLO Attainment</Button>
            </Link>
            <Link href="/faculty/reports/assessment-performance">
              <Button variant="outline" className="w-full">Assessment Performance</Button>
            </Link>
            <Link href="/faculty/reports/student-comparison">
              <Button variant="outline" className="w-full">Student Comparison</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Existing content can remain or be adjusted as needed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CLO Attainment Report (Preview)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cloAttainmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="clo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attainment" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Assessment Performance (Grade Distribution Preview)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Bloom Level Coverage Heatmap (Preview)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-1">
              <div className="font-bold"></div>
              {bloomLevels.map((level) => (
                <div key={level} className="font-bold text-xs text-center p-1">
                  {level}
                </div>
              ))}
              
              {clos.map((clo, rowIndex) => (
                <>
                  <div key={`${clo}-label`} className="font-bold text-xs p-1">
                    {clo}
                  </div>
                  {bloomLevels.map((_, colIndex) => {
                    const value = heatmapData[rowIndex][colIndex];
                    const intensity = value / 100;
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="text-center p-1 text-xs"
                        style={{
                          backgroundColor: `rgba(0, 151, 230, ${intensity})`,
                          color: intensity > 0.5 ? "white" : "black",
                        }}
                      >
                        {value}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Student Comparison (Preview)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentComparisonData.map((student) => (
                <TableRow key={student.name}>
                  <TableCell>{student.rank}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.score}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap gap-4">
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clo">CLO Attainment</SelectItem>
            <SelectItem value="grade">Grade Distribution</SelectItem>
            <SelectItem value="bloom">Bloom Coverage</SelectItem>
            <SelectItem value="student">Student Comparison</SelectItem>
          </SelectContent>
        </Select>
        <Button>Export to PDF</Button>
        <Button>Export to Excel</Button>
        <Button>Export to CSV</Button>
      </div>
    </div>
  );
}