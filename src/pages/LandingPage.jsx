import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  TrendingUp,
  Shield,
  Zap,
  Users,
  BarChart3,
  Clock,
  Lock,
  ArrowRight,
  Star,
  Bell,
} from "lucide-react";
import appConfig from "../config/appConfig";

function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield size={32} className="text-blue-400" />,
      title: "Secure Storage",
      description: "Your certifications are safely stored and accessible anytime",
    },
    {
      icon: <Bell size={32} className="text-purple-400" />,
      title: "Smart Reminders",
      description: "Get notified before your certificates expire",
    },
    {
      icon: <TrendingUp size={32} className="text-green-400" />,
      title: "Track Progress",
      description: "Monitor your certification journey with detailed analytics",
    },
    {
      icon: <BarChart3 size={32} className="text-pink-400" />,
      title: "Advanced Reports",
      description: "Generate comprehensive reports for compliance tracking",
    },
    {
      icon: <Zap size={32} className="text-yellow-400" />,
      title: "Lightning Fast",
      description: "Instant search and filtering across all certifications",
    },
    {
      icon: <Users size={32} className="text-indigo-400" />,
      title: "Team Management",
      description: "Manage team certifications with admin controls",
    },
  ];

  const stats = [
    { label: "Active Users", value: "1000+" },
    { label: "Certifications Tracked", value: "5000+" },
    { label: "Organizations", value: "50+" },
    { label: "Uptime", value: "99.9%" },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Account",
      description: "Sign up in seconds and get started immediately",
    },
    {
      number: "02",
      title: "Add Certifications",
      description: "Upload your certificates with details and expiry dates",
    },
    {
      number: "03",
      title: "Get Reminders",
      description: "Receive notifications before certificates expire",
    },
    {
      number: "04",
      title: "Track & Manage",
      description: "Monitor all your credentials in one dashboard",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-blue-900 text-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-black/40 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {appConfig.appName} {appConfig.appEmoji}
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 rounded-lg hover:bg-white/10 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:scale-105 transition font-semibold"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-8">
            <Star size={16} className="text-yellow-400" />
            <span className="text-sm text-blue-300">
              Trusted by organizations worldwide
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Manage Your
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Certifications Smartly
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Track, organize, and manage all your professional certifications in
            one secure platform. Get reminders, generate reports, and never miss
            an expiry date again.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:scale-105 transition font-semibold text-lg flex items-center justify-center gap-2 group"
            >
              Start Free Trial
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition"
              />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition font-semibold text-lg"
            >
              Sign In
            </button>
          </div>

          {/* Hero Image/Graphic */}
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 overflow-hidden group hover:border-white/20 transition">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
            <div className="relative">
              <div className="grid grid-cols-3 gap-4 md:gap-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-white/10 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-2">
                        {i * 5}K+
                      </div>
                      <p className="text-sm text-gray-400">
                        Certifications
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features
            </h3>
            <p className="text-xl text-gray-400">
              Everything you need to manage certifications effortlessly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-white/20 transition group hover:scale-105"
              >
                <div className="mb-4 p-3 bg-white/10 rounded-lg w-fit group-hover:bg-white/20 transition">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/10 hover:border-white/20 transition"
              >
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h3>
            <p className="text-xl text-gray-400">
              Get started in just 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/10 h-full hover:border-white/20 transition">
                  <div className="text-5xl font-bold text-blue-400/30 mb-4">
                    {step.number}
                  </div>
                  <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                  <p className="text-gray-400">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-4 top-1/2 transform -translate-y-1/2">
                    <ArrowRight size={24} className="text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl p-12 rounded-3xl border border-white/10 text-center">
            <h3 className="text-4xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of users managing their certifications with ease
            </p>
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:scale-105 transition font-semibold text-lg flex items-center justify-center gap-2 group mx-auto"
            >
              Start Your Free Account
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition"
              />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="relative py-12 px-6 border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className="text-gray-400">
            © 2026 {appConfig.appName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              Contact
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
