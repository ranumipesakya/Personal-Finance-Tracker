import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, PieChart, Shield, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-foreground">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xl">
            P
          </div>
          Pocket Honey
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-muted hover:text-foreground font-medium transition-colors">
            Login
          </Link>
          <Link 
            to="/register" 
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-primary/25"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Abstract background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -z-10 mix-blend-multiply dark:mix-blend-lighten" />

        <div className="text-center max-w-3xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
              AI-Powered Financial Assistant
            </span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Track your money <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">smarter</span> than ever.
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Take control of your personal finances with AI-driven insights, beautiful analytics, and smart budgeting tools.
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link 
              to="/register" 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-medium text-lg transition-all shadow-xl hover:shadow-primary/30 flex items-center gap-2 group"
            >
              Start for free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <motion.div 
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <div className="bg-background/80 backdrop-blur-md p-6 rounded-3xl border border-secondary shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Analytics</h3>
            <p className="text-muted">Visualize your spending patterns beautifully and understand where your money goes.</p>
          </div>
          
          <div className="bg-background/80 backdrop-blur-md p-6 rounded-3xl border border-secondary shadow-sm">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Insights</h3>
            <p className="text-muted">Get actionable, personalized advice on saving and budgeting fueled by AI.</p>
          </div>
          
          <div className="bg-background/80 backdrop-blur-md p-6 rounded-3xl border border-secondary shadow-sm">
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
            <p className="text-muted">Your financial data is encrypted and secure. We value your privacy over everything.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
