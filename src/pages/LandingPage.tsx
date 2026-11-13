import { Link } from 'react-router-dom';
import {
  Sprout,
  Satellite,
  BarChart3,
  Shield,
  ChevronRight,
  Leaf,
  Droplets,
  TrendingUp,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-crop-green-900 via-crop-green-800 to-crop-green-950">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMkgyVjBoMzR6TTAgMzRWMmgydjMyei8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-crop-green-400/30 bg-crop-green-800/50 px-4 py-1.5 text-sm text-crop-green-200">
              <Satellite className="h-4 w-4" />
              Powered by NASA Earth Observations
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Intelligent Crop Sequence
              <span className="block text-crop-green-300">Optimization</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-crop-green-100/90 sm:text-xl">
              Leverage AI and satellite-derived environmental data to plan multi-season
              crop rotations that maximize yield, protect soil health, and adapt to
              climate conditions.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/intake"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-crop-green-800 shadow-lg transition-all hover:bg-crop-green-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Start Optimization
                <ChevronRight className="h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-lg border border-crop-green-400/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-crop-green-800/50"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Data-Driven Agriculture
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our recommendation engine synthesizes NASA satellite data, soil science,
              and agronomic research to deliver actionable crop planning.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Satellite className="h-6 w-6" />}
              title="NASA Earth Data Integration"
              description="SMAP soil moisture, GPM precipitation, and MODIS land cover data feed directly into the optimization model."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Multi-Objective Optimization"
              description="Pareto-optimal sequences balance profit, soil health, water efficiency, and climate resilience simultaneously."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Risk Analysis"
              description="Dynamic warnings for drought vulnerability, pest pressure, and extreme weather events based on real environmental data."
            />
            <FeatureCard
              icon={<Leaf className="h-6 w-6" />}
              title="Soil Health Tracking"
              description="Project organic matter changes, carbon sequestration potential, and nutrient cycling across your rotation plan."
            />
            <FeatureCard
              icon={<Droplets className="h-6 w-6" />}
              title="Water Conservation"
              description="Optimize water footprint by matching crop water demands with precipitation patterns and irrigation capacity."
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Economic Projections"
              description="Season-by-season cost and revenue estimates with cumulative net return projections for your full rotation."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-crop-green-50/50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <StepCard
              step={1}
              title="Describe Your Farm"
              description="Tell us about your location, soil conditions, equipment, and goals through our guided intake process."
            />
            <StepCard
              step={2}
              title="AI Optimization"
              description="Our engine analyzes NASA satellite data alongside your farm profile to generate optimal crop sequences."
            />
            <StepCard
              step={3}
              title="Actionable Results"
              description="Review recommended rotations, Pareto alternatives, projected outcomes, and risk warnings."
            />
          </div>

          <div className="mt-12 text-center">
            <Link to="/intake" className="btn-primary text-base px-10 py-4">
              <Sprout className="h-5 w-5" />
              Begin Farm Assessment
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card-hover group">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-crop-green-100 text-crop-green-700 group-hover:bg-crop-green-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-crop-green-600 text-xl font-bold text-white shadow-lg">
        {step}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}
