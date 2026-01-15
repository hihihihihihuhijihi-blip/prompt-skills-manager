import Link from "next/link";
import { Sparkles, Zap, ArrowRight, Bot, Lightbulb, FileText, BarChart3 } from "lucide-react";
import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to dashboard directly
  redirect("/dashboard");
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl card-hover text-center">
      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mx-auto mb-6`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
