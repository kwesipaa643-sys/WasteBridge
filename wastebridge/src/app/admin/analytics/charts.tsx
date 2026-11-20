"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SimpleBar({ data, xKey, yKey, color = "#10b981" }: { data: any[]; xKey: string; yKey: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid stroke="#1e293b" vertical={false} />
        <XAxis dataKey={xKey} stroke="#94a3b8" /><YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
