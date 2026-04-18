import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function Analytics() {
  const { transactions, fetchTransactions, formatCurrency } = useStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const expenses = transactions.filter((t: any) => t.type === 'expense');
  
  // Group by category for Pie Chart
  const expensesByCategory = expenses.reduce((acc: any, curr: any) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  // Group by date for Bar Chart (Last 7 days)
  const expensesByDate = expenses.reduce((acc: any, curr: any) => {
    const date = new Date(curr.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + curr.amount;
    return acc;
  }, {});

  const barData = Object.keys(expensesByDate).slice(0, 7).reverse().map(key => ({
    name: key,
    amount: expensesByDate[key]
  }));

  // Monthly breakdown for Line Chart
  const monthlyDataMap = transactions.reduce((acc: any, curr: any) => {
    const month = new Date(curr.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    if (!acc[month]) acc[month] = { name: month, income: 0, expense: 0 };
    if (curr.type === 'income') acc[month].income += curr.amount;
    else acc[month].expense += curr.amount;
    return acc;
  }, {});

  const monthlyData = Object.values(monthlyDataMap).slice(-6);

  const exportToPDF = () => {
    const input = document.getElementById('analytics-report');
    if (!input) return;

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("pocket-honey-report.pdf");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted text-sm mt-1">Deep dive into your spending patterns.</p>
        </div>
        <button
          onClick={exportToPDF}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export (PDF)
        </button>
      </div>

      <div id="analytics-report" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-background border border-secondary rounded-2xl p-6 shadow-sm"
          >
            <h3 className="font-bold text-lg mb-6 text-center">Expense by Category</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--secondary)', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm text-balance">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-muted truncate max-w-[100px]">{entry.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-background border border-secondary rounded-2xl p-6 shadow-sm"
          >
            <h3 className="font-bold text-lg mb-6">Weekly Expense Trend</h3>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--secondary)" />
                  <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                     formatter={(value: any) => formatCurrency(value)}
                     contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--secondary)', borderRadius: '12px' }}
                     cursor={{ fill: 'var(--secondary)', opacity: 0.2 }}
                  />
                  <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-background border border-secondary rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-bold text-lg mb-6">Cash Flow Trend (Monthly)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--secondary)" />
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                   formatter={(value: any) => formatCurrency(value)}
                   contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--secondary)', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-muted">Income</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-danger" />
              <span className="text-muted">Expense</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

