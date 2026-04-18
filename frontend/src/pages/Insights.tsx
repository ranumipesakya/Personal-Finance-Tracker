import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { BrainCircuit, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

export default function Insights() {
  const { insights, fetchInsights } = useStore();

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-10 py-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <BrainCircuit className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">AI Financial Insights</h1>
        <p className="text-muted mt-2">Smart analysis of your spending behavior.</p>
      </div>

      <div className="space-y-4">
        {insights.map((insight: any, i: number) => {
          let Icon = CheckCircle;
          let colorClass = 'text-success bg-success/10 border-success/20';
          let iconColor = 'text-success';

          if (insight.type === 'alert') {
            Icon = AlertTriangle;
            colorClass = 'text-danger bg-danger/10 border-danger/20';
            iconColor = 'text-danger';
          } else if (insight.type === 'warning' || insight.type === 'insight') {
            Icon = AlertTriangle;
            colorClass = 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            iconColor = 'text-orange-500';
          } else if (insight.type === 'prediction') {
            Icon = TrendingUp;
            colorClass = 'text-primary bg-primary/10 border-primary/20';
            iconColor = 'text-primary';
          }

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-2xl border ${colorClass} flex items-start gap-4`}
            >
              <div className="mt-1">
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <div>
                <p className={`font-medium ${colorClass.split(' ')[0]}`}>
                  {insight.message}
                </p>
              </div>
            </motion.div>
          );
        })}

        {insights.length === 0 && (
          <div className="text-center p-8 bg-secondary/10 rounded-2xl border border-secondary text-muted">
            Analyzing your data... (Ensure you have enough transactions spanning across months)
          </div>
        )}
      </div>
    </div>
  );
}
