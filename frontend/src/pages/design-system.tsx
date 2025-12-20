import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KPICard } from "@/components/kpi-card";
import { AccountCard } from "@/components/account-card";
import { FeatureShowcase } from "@/components/feature-showcase";
import { TrendingUp, DollarSign, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme.context";

export function DesignSystemPage() {
  const { theme, setTheme } = useTheme();
  const sampleAccount = {
    id: 'sample',
    name: 'Sample Account',
    type: 'Checking',
    balance: 12345.67,
    currency: 'USD',
    status: 'active' as const,
    accountNumber: '****1234'
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1>Design System</h1>
          <p className="text-muted-foreground mt-1">
            Component library and design tokens for the FinTech Dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="theme-select" className="text-sm">Theme:</Label>
          <Select value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark')}>
            <SelectTrigger id="theme-select" className="w-[140px]">
              <div className="flex items-center gap-2">
                {theme === 'light' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <SelectValue placeholder="Select theme" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <span className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <span>Light</span>
                </span>
              </SelectItem>
              <SelectItem value="dark">
                <span className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  <span>Dark</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feature Showcase */}
      <FeatureShowcase />

      <Separator />

      {/* Color Palette */}
      <section>
        <h2 className="mb-6">Color Tokens</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-sm">Brand Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="h-20 rounded-lg bg-primary mb-2" />
                <p className="text-sm">Primary</p>
                <p className="text-xs text-muted-foreground">--primary</p>
              </div>
              <div>
                <div className="h-20 rounded-lg bg-secondary mb-2" />
                <p className="text-sm">Secondary</p>
                <p className="text-xs text-muted-foreground">--secondary</p>
              </div>
              <div>
                <div className="h-20 rounded-lg bg-muted mb-2" />
                <p className="text-sm">Muted</p>
                <p className="text-xs text-muted-foreground">--muted</p>
              </div>
              <div>
                <div className="h-20 rounded-lg bg-accent mb-2" />
                <p className="text-sm">Accent</p>
                <p className="text-xs text-muted-foreground">--accent</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm">Financial State Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="h-20 rounded-lg bg-[var(--positive)] mb-2" />
                <p className="text-sm">Positive</p>
                <p className="text-xs text-muted-foreground">--positive</p>
              </div>
              <div>
                <div className="h-20 rounded-lg bg-[var(--negative)] mb-2" />
                <p className="text-sm">Negative</p>
                <p className="text-xs text-muted-foreground">--negative</p>
              </div>
              <div>
                <div className="h-20 rounded-lg bg-[var(--warning)] mb-2" />
                <p className="text-sm">Warning</p>
                <p className="text-xs text-muted-foreground">--warning</p>
              </div>
              <div>
                <div className="h-20 rounded-lg bg-[var(--info)] mb-2" />
                <p className="text-sm">Info</p>
                <p className="text-xs text-muted-foreground">--info</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm">Chart Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num}>
                  <div className={`h-20 rounded-lg bg-[var(--chart-${num})] mb-2`} />
                  <p className="text-sm">Chart {num}</p>
                  <p className="text-xs text-muted-foreground">--chart-{num}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Typography */}
      <section>
        <h2 className="mb-6">Typography</h2>
        <div className="space-y-4">
          <div>
            <h1>Heading 1 - Financial Dashboard</h1>
            <p className="text-sm text-muted-foreground">h1 tag, default styling</p>
          </div>
          <div>
            <h2>Heading 2 - Account Summary</h2>
            <p className="text-sm text-muted-foreground">h2 tag, default styling</p>
          </div>
          <div>
            <h3>Heading 3 - Transaction Details</h3>
            <p className="text-sm text-muted-foreground">h3 tag, default styling</p>
          </div>
          <div>
            <h4>Heading 4 - Card Title</h4>
            <p className="text-sm text-muted-foreground">h4 tag, default styling</p>
          </div>
          <div>
            <p>Body text - Regular paragraph with normal weight and line height for content readability.</p>
            <p className="text-sm text-muted-foreground">p tag, default styling</p>
          </div>
          <div>
            <p className="text-muted-foreground">Muted text - Secondary information with reduced emphasis.</p>
            <p className="text-sm text-muted-foreground">text-muted-foreground class</p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Spacing & Radius */}
      <section>
        <h2 className="mb-6">Spacing & Border Radius</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="mb-4 text-sm">Border Radius</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-sm" />
                <div>
                  <p className="text-sm">Small (sm)</p>
                  <p className="text-xs text-muted-foreground">4px</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-md" />
                <div>
                  <p className="text-sm">Medium (md)</p>
                  <p className="text-xs text-muted-foreground">6px</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-lg" />
                <div>
                  <p className="text-sm">Large (lg)</p>
                  <p className="text-xs text-muted-foreground">10px</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-xl" />
                <div>
                  <p className="text-sm">Extra Large (xl)</p>
                  <p className="text-xs text-muted-foreground">14px</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm">Elevation (Shadows)</h3>
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm">Small shadow</p>
                <p className="text-xs text-muted-foreground">Cards, list items</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-md">
                <p className="text-sm">Medium shadow</p>
                <p className="text-xs text-muted-foreground">Modals, dropdowns</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-lg">
                <p className="text-sm">Large shadow</p>
                <p className="text-xs text-muted-foreground">Featured cards, overlays</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Buttons */}
      <section>
        <h2 className="mb-6">Buttons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="mb-4 text-sm">Primary</h3>
            <div className="space-y-2">
              <Button className="w-full">Default</Button>
              <Button className="w-full bg-slate-900 hover:bg-slate-800">Primary Action</Button>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm">Secondary</h3>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full">Secondary</Button>
              <Button variant="outline" className="w-full">Outline</Button>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm">Other Variants</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full">Ghost</Button>
              <Button variant="destructive" className="w-full">Destructive</Button>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Badges */}
      <section>
        <h2 className="mb-6">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge className="bg-[var(--positive)] text-white">Active</Badge>
          <Badge className="bg-[var(--warning)] text-white">Pending</Badge>
          <Badge className="bg-[var(--negative)] text-white">Failed</Badge>
          <Badge className="bg-[var(--info)] text-white">Info</Badge>
        </div>
      </section>

      <Separator />

      {/* Form Elements */}
      <section>
        <h2 className="mb-6">Form Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="sample-input">Input Field</Label>
              <Input 
                id="sample-input"
                placeholder="Enter text..." 
                className="mt-1 bg-input-background border-0"
              />
            </div>
            
            <div>
              <Label htmlFor="sample-email">Email Input</Label>
              <Input 
                id="sample-email"
                type="email"
                placeholder="you@example.com" 
                className="mt-1 bg-input-background border-0"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="sample-number">Number Input</Label>
              <Input 
                id="sample-number"
                type="number"
                placeholder="0.00" 
                className="mt-1 bg-input-background border-0"
              />
            </div>
            
            <div>
              <Label htmlFor="sample-disabled">Disabled Input</Label>
              <Input 
                id="sample-disabled"
                placeholder="Disabled" 
                disabled
                className="mt-1 bg-input-background border-0"
              />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Component Examples */}
      <section>
        <h2 className="mb-6">Dashboard Components</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="mb-4">KPI Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KPICard
                title="Total Balance"
                value="$24,580.50"
                change={8.2}
                icon={<DollarSign className="h-6 w-6 text-[var(--positive)]" />}
              />
              <KPICard
                title="Monthly Growth"
                value="+12.4%"
                change={-3.5}
                icon={<TrendingUp className="h-6 w-6 text-[var(--info)]" />}
              />
            </div>
          </div>

          <div>
            <h3 className="mb-4">Account Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AccountCard account={sampleAccount} />
              <AccountCard account={sampleAccount} featured />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Usage Guidelines */}
      <section>
        <h2 className="mb-6">Usage Guidelines</h2>
        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <div className="space-y-4">
            <div>
              <h3 className="mb-2">Accessibility</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>All components meet WCAG AA contrast requirements</li>
                <li>Focus states are clearly visible for keyboard navigation</li>
                <li>Font sizes are readable (minimum 14px for body text)</li>
                <li>Interactive elements have minimum touch targets of 44x44px</li>
              </ul>
            </div>
            
            <div>
              <h3 className="mb-2">Responsive Design</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Desktop-first approach with breakpoints at 768px and 1024px</li>
                <li>Grid layouts adapt from multi-column to single-column on mobile</li>
                <li>Navigation switches to mobile menu on smaller screens</li>
                <li>Touch-friendly spacing and button sizes on mobile devices</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2">Component Architecture</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Built with React and TypeScript for type safety</li>
                <li>Styled using Tailwind CSS with custom design tokens</li>
                <li>Modular component structure for easy reusability</li>
                <li>Consistent naming conventions and file organization</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}