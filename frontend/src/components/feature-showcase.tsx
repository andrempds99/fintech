import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Shield, 
  Smartphone, 
  Palette, 
  BarChart3, 
  Lock,
  Zap,
  CheckCircle
} from "lucide-react";

export function FeatureShowcase() {
  const features = [
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Bank-grade security with encrypted transactions and secure authentication",
      color: "text-[var(--positive)]"
    },
    {
      icon: Smartphone,
      title: "Fully Responsive",
      description: "Optimized for desktop, tablet, and mobile devices with touch-friendly controls",
      color: "text-[var(--info)]"
    },
    {
      icon: Palette,
      title: "Modern Design System",
      description: "Clean, professional UI with comprehensive design tokens and reusable components",
      color: "text-[var(--chart-1)]"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Interactive charts and insights powered by Recharts for data visualization",
      color: "text-[var(--chart-2)]"
    },
    {
      icon: Zap,
      title: "High Performance",
      description: "Built with React and TypeScript for type-safe, performant user experience",
      color: "text-[var(--warning)]"
    },
    {
      icon: Lock,
      title: "Role-Based Access",
      description: "Admin dashboard with user management and audit logging capabilities",
      color: "text-[var(--chart-3)]"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Badge className="bg-[var(--positive)] text-white mb-4">
          Production Ready
        </Badge>
        <h1 className="mb-2">FinTech Dashboard Features</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A comprehensive financial dashboard with all the features you need for modern banking applications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary mb-4 ${feature.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-8 rounded-xl shadow-sm border border-border bg-gradient-to-br from-slate-50 to-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="mb-4">Pages Included</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--positive)]" />
                <span className="text-sm">Authentication (Login & Password Reset)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--positive)]" />
                <span className="text-sm">Main Dashboard with KPIs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--positive)]" />
                <span className="text-sm">Accounts & Wallets Management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--positive)]" />
                <span className="text-sm">Transactions with Filters</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--positive)]" />
                <span className="text-sm">Transfer Funds Interface</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--positive)]" />
                <span className="text-sm">Analytics & Insights</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--positive)]" />
                <span className="text-sm">Admin Dashboard</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4">Key Technologies</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">React</Badge>
              <Badge variant="outline">TypeScript</Badge>
              <Badge variant="outline">Tailwind CSS</Badge>
              <Badge variant="outline">Recharts</Badge>
              <Badge variant="outline">Lucide Icons</Badge>
              <Badge variant="outline">Radix UI</Badge>
            </div>

            <h3 className="mt-6 mb-4">Mock Data</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--positive)]" />
                <span className="text-sm">Realistic account balances</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--positive)]" />
                <span className="text-sm">Sample transactions & merchants</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--positive)]" />
                <span className="text-sm">Chart data & analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--positive)]" />
                <span className="text-sm">User management & audit logs</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
