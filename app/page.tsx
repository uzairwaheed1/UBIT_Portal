"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Link2,
  TrendingUp,
  FileText,
  Code,
  Database,
  BarChart3,
  GraduationCap,
  ArrowRight,
  Check,
  Users,
  Shield,
  Zap,
  Globe,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Facebook,
} from "lucide-react"

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const detailed1Ref = useRef<HTMLDivElement>(null)
  const detailed2Ref = useRef<HTMLDivElement>(null)
  const detailed3Ref = useRef<HTMLDivElement>(null)
  const integrationsRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0")
          entry.target.classList.remove("opacity-0", "translate-y-8")
        }
      })
    }, observerOptions)

    const refs = [
      heroRef,
      featuresRef,
      detailed1Ref,
      detailed2Ref,
      detailed3Ref,
      integrationsRef,
      testimonialsRef,
      ctaRef,
    ]
    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current)
      }
    })

    return () => {
      refs.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current)
        }
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8" style={{ color: "#1f2937" }} />
              <span className="text-xl font-bold" style={{ color: "#1f2937" }}>
                OBE System
              </span>
            </div>
            <Link href="/login">
              <Button
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-500 transition-all duration-300"
                style={{ borderRadius: "8px" }}
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative py-12 lg:py-20 transition-all duration-1000 opacity-0 translate-y-8"
        style={{
          background: "linear-gradient(135deg, #1a1f3a 0%, #2d1b4e 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text (60%) */}
            <div className="lg:col-span-3">
              <h1
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white mb-6 leading-[1.2]"
                style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
              >
                Welcome to OBE System
              </h1>
              <p
                className="text-2xl sm:text-3xl font-light text-white mb-6 leading-relaxed"
                style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
              >
                Automating Outcome-Based Education for Smarter Academic Evaluation
              </p>
              <p
                className="text-lg sm:text-xl mb-8 leading-relaxed"
                style={{ color: "#d1d5db", fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
              >
                A comprehensive cloud-based platform that streamlines CLO–PLO–PEO evaluation,
                <br className="hidden sm:block" />
                enabling continuous quality improvement and PEC-aligned outcome assessment.
              </p>
              <Link href="/login">
                <Button
                  size="lg"
                  className="text-white font-semibold text-lg px-8 py-4 rounded-lg shadow-lg hover:scale-105 transition-all duration-300 group"
                  style={{
                    background: "linear-gradient(90deg, #ff6b35 0%, #f94144 100%)",
                    borderRadius: "8px",
                  }}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Right Column - Image (40%) */}
            <div className="lg:col-span-2 flex justify-center lg:justify-end">
              <div className="relative animate-float">
                <div
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20"
                  style={{ borderRadius: "24px" }}
                >
                  <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl p-6 h-64 w-full flex items-center justify-center">
                    <BarChart3 className="h-32 w-32 text-white opacity-80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section
        ref={featuresRef}
        className="py-12 lg:py-20 transition-all duration-1000 opacity-0 translate-y-8"
        style={{ backgroundColor: "#f9fafb" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "#1f2937", fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
            >
              Key Features
            </h2>
            <p
              className="text-lg max-w-[700px] mx-auto"
              style={{ color: "#6b7280", fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
            >
              Powerful tools designed to simplify outcome-based education management and evaluation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div
              className="bg-white p-8 rounded-xl shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              style={{ borderRadius: "12px" }}
            >
              <div className="mb-6 flex justify-center">
                <BookOpen className="h-12 w-12" style={{ color: "#ff6b35" }} />
              </div>
              <h3
                className="text-xl font-bold mb-3 text-center"
                style={{ color: "#1f2937", fontSize: "1.3rem" }}
              >
                Course Management
              </h3>
              <p
                className="text-center leading-relaxed"
                style={{ color: "#6b7280", fontSize: "0.95rem" }}
              >
                Manage courses and assessment entry with ease and efficiency. Streamline your academic workflow.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div
              className="bg-white p-8 rounded-xl shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              style={{ borderRadius: "12px" }}
            >
              <div className="mb-6 flex justify-center">
                <Link2 className="h-12 w-12" style={{ color: "#ff6b35" }} />
              </div>
              <h3
                className="text-xl font-bold mb-3 text-center"
                style={{ color: "#1f2937", fontSize: "1.3rem" }}
              >
                CLO–PLO Mapping
              </h3>
              <p
                className="text-center leading-relaxed"
                style={{ color: "#6b7280", fontSize: "0.95rem" }}
              >
                Link course outcomes to program outcomes seamlessly. Visualize and track outcome relationships.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div
              className="bg-white p-8 rounded-xl shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              style={{ borderRadius: "12px" }}
            >
              <div className="mb-6 flex justify-center">
                <TrendingUp className="h-12 w-12" style={{ color: "#ff6b35" }} />
              </div>
              <h3
                className="text-xl font-bold mb-3 text-center"
                style={{ color: "#1f2937", fontSize: "1.3rem" }}
              >
                PEO Analysis
              </h3>
              <p
                className="text-center leading-relaxed"
                style={{ color: "#6b7280", fontSize: "0.95rem" }}
              >
                Evaluate program educational objectives from surveys. Generate comprehensive analysis reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Feature 1 - Image Left, Text Right */}
      <section
        ref={detailed1Ref}
        className="py-12 lg:py-20 transition-all duration-1000 opacity-0 translate-y-8"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Side */}
            <div className="order-2 lg:order-1">
              <div
                className="rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-transform duration-300"
                style={{ borderRadius: "24px" }}
              >
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-12 h-80 flex items-center justify-center">
                  <BookOpen className="h-40 w-40" style={{ color: "#1f2937" }} />
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div className="order-1 lg:order-2">
              <span
                className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4"
                style={{ backgroundColor: "#ff6b35", color: "white", borderRadius: "9999px" }}
              >
                Course Management
              </span>
              <h3
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: "#1f2937", fontSize: "2rem" }}
              >
                Comprehensive Course Management
              </h3>
              <p
                className="text-lg mb-6 leading-relaxed"
                style={{ color: "#6b7280", lineHeight: "1.7" }}
              >
                Manage all your courses in one centralized platform. Create, edit, and organize course materials,
                assessments, and student data with intuitive tools designed for academic excellence.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Streamlined course creation and management",
                  "Automated assessment tracking",
                  "Real-time student progress monitoring",
                  "Integrated gradebook functionality",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "#ff6b35" }} />
                    <span style={{ color: "#4b5563" }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login" className="inline-flex items-center gap-2 group">
                <span
                  className="font-semibold group-hover:gap-4 transition-all duration-300"
                  style={{ color: "#ff6b35" }}
                >
                  Learn More
                </span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" style={{ color: "#ff6b35" }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Feature 2 - Text Left, Image Right */}
      <section
        ref={detailed2Ref}
        className="py-12 lg:py-20 transition-all duration-1000 opacity-0 translate-y-8"
        style={{ backgroundColor: "#fafafa" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Side */}
            <div>
              <span
                className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4"
                style={{ backgroundColor: "#ff6b35", color: "white", borderRadius: "9999px" }}
              >
                Outcome Mapping
              </span>
              <h3
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: "#1f2937", fontSize: "2rem" }}
              >
                Advanced CLO–PLO Mapping
              </h3>
              <p
                className="text-lg mb-6 leading-relaxed"
                style={{ color: "#6b7280", lineHeight: "1.7" }}
              >
                Visualize and manage the complex relationships between Course Learning Outcomes and Program
                Learning Outcomes. Track attainment and identify gaps in your curriculum.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Interactive mapping interface",
                  "Automated outcome tracking",
                  "Gap analysis and recommendations",
                  "PEC compliance verification",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "#ff6b35" }} />
                    <span style={{ color: "#4b5563" }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login" className="inline-flex items-center gap-2 group">
                <span
                  className="font-semibold group-hover:gap-4 transition-all duration-300"
                  style={{ color: "#ff6b35" }}
                >
                  Learn More
                </span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" style={{ color: "#ff6b35" }} />
              </Link>
            </div>

            {/* Image Side */}
            <div>
              <div
                className="rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-transform duration-300"
                style={{ borderRadius: "24px" }}
              >
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-12 h-80 flex items-center justify-center">
                  <Link2 className="h-40 w-40" style={{ color: "#1f2937" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Feature 3 - Image Left, Text Right */}
      <section
        ref={detailed3Ref}
        className="py-12 lg:py-20 transition-all duration-1000 opacity-0 translate-y-8"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Side */}
            <div className="order-2 lg:order-1">
              <div
                className="rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-transform duration-300"
                style={{ borderRadius: "24px" }}
              >
                <div className="bg-gradient-to-br from-green-100 to-blue-100 p-12 h-80 flex items-center justify-center">
                  <FileText className="h-40 w-40" style={{ color: "#1f2937" }} />
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div className="order-1 lg:order-2">
              <span
                className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4"
                style={{ backgroundColor: "#ff6b35", color: "white", borderRadius: "9999px" }}
              >
                Analytics & Reports
              </span>
              <h3
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: "#1f2937", fontSize: "2rem" }}
              >
                Automated Reports & CQI
              </h3>
              <p
                className="text-lg mb-6 leading-relaxed"
                style={{ color: "#6b7280", lineHeight: "1.7" }}
              >
                Generate comprehensive reports automatically. Get actionable insights for Continuous Quality
                Improvement with data-driven recommendations.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Automated report generation",
                  "CQI recommendations engine",
                  "Visual analytics dashboard",
                  "Export to multiple formats",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "#ff6b35" }} />
                    <span style={{ color: "#4b5563" }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login" className="inline-flex items-center gap-2 group">
                <span
                  className="font-semibold group-hover:gap-4 transition-all duration-300"
                  style={{ color: "#ff6b35" }}
                >
                  Learn More
                </span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" style={{ color: "#ff6b35" }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations/Additional Features Section */}
      <section
        ref={integrationsRef}
        className="py-12 lg:py-20 transition-all duration-1000 opacity-0 translate-y-8"
        style={{ backgroundColor: "#f9fafb" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "#1f2937", fontSize: "2.5rem" }}
            >
              Technology Stack
            </h2>
            <p
              className="text-lg max-w-[700px] mx-auto"
              style={{ color: "#6b7280" }}
            >
              Built with modern technologies for scalability, performance, and maintainability
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {[
              { icon: Code, name: "Next.js", color: "#1f2937" },
              { icon: Code, name: "NestJS", color: "#e11d48" },
              { icon: Database, name: "MongoDB", color: "#10b981" },
              { icon: BarChart3, name: "Chart.js", color: "#3b82f6" },
            ].map((tech, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-orange-500 transition-all duration-300 cursor-pointer text-center"
                style={{ borderRadius: "12px" }}
              >
                <div className="mb-4 flex justify-center">
                  <tech.icon className="h-12 w-12" style={{ color: tech.color }} />
                </div>
                <h4 className="font-semibold" style={{ color: "#1f2937" }}>
                  {tech.name}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials/Advisory Section */}
      <section
        ref={testimonialsRef}
        className="py-12 lg:py-20 transition-all duration-1000 opacity-0 translate-y-8"
        style={{
          background: "linear-gradient(135deg, #1a1f3a 0%, #2d1b4e 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4 text-white"
              style={{ fontSize: "2.5rem" }}
            >
              Developed by Academic Excellence
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Created by FYP Group at UBIT, University of Karachi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Academic Focus",
                description: "Designed specifically for educational institutions and outcome-based evaluation.",
                icon: GraduationCap,
              },
              {
                title: "PEC Aligned",
                description: "Fully compliant with Pakistan Engineering Council standards and requirements.",
                icon: Shield,
              },
              {
                title: "Innovation Driven",
                description: "Leveraging cutting-edge technology for modern academic management.",
                icon: Zap,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20"
                style={{ borderRadius: "12px" }}
              >
                <div className="mb-4">
                  <item.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-blue-100 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
   
      {/* Footer */}
      <footer style={{ backgroundColor: "#0f172a" }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Column */}
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Company</h4>
              <ul className="space-y-2">
                {["About Us", "Our Team", "Careers", "Contact"].map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href="#"
                      className="text-gray-400 hover:text-orange-500 transition-colors duration-300"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Product</h4>
              <ul className="space-y-2">
                {["Features", "Pricing", "Documentation", "Support"].map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href="#"
                      className="text-gray-400 hover:text-orange-500 transition-colors duration-300"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Resources</h4>
              <ul className="space-y-2">
                {["Blog", "Case Studies", "Webinars", "Help Center"].map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href="#"
                      className="text-gray-400 hover:text-orange-500 transition-colors duration-300"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>info@obesystem.edu</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span>+92 300 1234567</span>
                </li>
                <li className="flex items-start gap-2 text-gray-400">
                  <MapPin className="h-4 w-4 mt-1" />
                  <span>University of Karachi, UBIT</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} OBE System. All rights reserved. Developed by FYP Group – UBIT,
                University of Karachi.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: Twitter, href: "#" },
                  { icon: Linkedin, href: "#" },
                  { icon: Github, href: "#" },
                  { icon: Facebook, href: "#" },
                ].map((social, idx) => (
                  <Link
                    key={idx}
                    href={social.href}
                    className="text-gray-400 hover:text-orange-500 transition-colors duration-300"
                  >
                    <social.icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
