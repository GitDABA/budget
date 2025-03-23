'use client';

import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import Navigation from '@/components/layout/Navigation';
import { useState } from 'react';
import AnimatedContainer from '@/components/ui/animatedcontainer';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center">
              <AnimatedContainer 
                className="lg:w-1/2 mb-12 lg:mb-0"
                variant="fadeIn"
                delay={0.1}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="text-blue-600 dark:text-blue-400">Smart</span> Budgeting Made Simple
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
                  Take control of your finances with our powerful budget tracking app. 
                  Create custom budgets, track expenses, and visualize your spending habits 
                  with beautiful charts.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  {user ? (
                    <Link 
                      href="/"
                      className="inline-flex justify-center items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <Link 
                      href="/login"
                      className="inline-flex justify-center items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                    >
                      Get Started
                    </Link>
                  )}
                  <button
                    onClick={() => setShowDemoVideo(true)}
                    className="inline-flex justify-center items-center px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Watch Demo
                  </button>
                </div>
              </AnimatedContainer>
              <AnimatedContainer 
                className="lg:w-1/2 lg:pl-12"
                variant="slideRight"
                delay={0.3}
              >
                <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
                  <div className="aspect-w-16 aspect-h-9">
                    <img 
                      src="/budget-app-demo.png" 
                      alt="Budget App Dashboard" 
                      className="rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/800x450?text=Budget+Tracker+Dashboard";
                      }}
                    />
                  </div>
                </div>
              </AnimatedContainer>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <AnimatedContainer className="text-center mb-16" variant="fadeIn">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Everything you need to efficiently manage and track your budgets in one place.
              </p>
            </AnimatedContainer>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatedContainer className="feature-card" variant="fadeIn" delay={0.1}>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md h-full">
                  <div className="text-blue-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Visual Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Interactive charts and graphics help you understand your spending patterns at a glance.
                  </p>
                </div>
              </AnimatedContainer>
              
              <AnimatedContainer className="feature-card" variant="fadeIn" delay={0.2}>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md h-full">
                  <div className="text-blue-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Real-time Tracking</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Add expenses on the go and see your budget update instantly for immediate feedback.
                  </p>
                </div>
              </AnimatedContainer>
              
              <AnimatedContainer className="feature-card" variant="fadeIn" delay={0.3}>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md h-full">
                  <div className="text-blue-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Multiple Budgets</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create and manage multiple budget plans for different purposes or time periods.
                  </p>
                </div>
              </AnimatedContainer>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <AnimatedContainer className="text-center mb-16" variant="fadeIn">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Users Say</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Our users love how easy it is to take control of their finances.
              </p>
            </AnimatedContainer>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatedContainer variant="fadeIn" delay={0.1}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xl font-bold mr-4">
                      JD
                    </div>
                    <div>
                      <h4 className="font-bold">John Doe</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Finance Manager</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    "This budget app has completely changed how I manage my finances. The visual breakdowns make it so easy to see where my money is going."
                  </p>
                </div>
              </AnimatedContainer>
              
              <AnimatedContainer variant="fadeIn" delay={0.2}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xl font-bold mr-4">
                      SM
                    </div>
                    <div>
                      <h4 className="font-bold">Sarah Miller</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Small Business Owner</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    "I use this app both for my personal finances and my small business. Being able to create multiple budgets with custom categories is a game-changer."
                  </p>
                </div>
              </AnimatedContainer>
              
              <AnimatedContainer variant="fadeIn" delay={0.3}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xl font-bold mr-4">
                      AR
                    </div>
                    <div>
                      <h4 className="font-bold">Alex Rodriguez</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Student</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    "As a student, keeping track of my limited budget is crucial. This app makes it simple and even helps me plan for future expenses."
                  </p>
                </div>
              </AnimatedContainer>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600 dark:bg-blue-800">
          <div className="container mx-auto px-4 text-center">
            <AnimatedContainer variant="fadeIn">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Take Control of Your Finances?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Join thousands of users who have transformed their financial habits with our budget tracker.
              </p>
              {user ? (
                <Link 
                  href="/"
                  className="inline-flex justify-center items-center px-8 py-4 rounded-lg bg-white hover:bg-gray-100 text-blue-600 font-medium transition-colors duration-200 text-lg"
                >
                  Go to Your Dashboard
                </Link>
              ) : (
                <Link 
                  href="/login"
                  className="inline-flex justify-center items-center px-8 py-4 rounded-lg bg-white hover:bg-gray-100 text-blue-600 font-medium transition-colors duration-200 text-lg"
                >
                  Start for Free
                </Link>
              )}
            </AnimatedContainer>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-gray-100 dark:bg-gray-900 text-center">
          <div className="container mx-auto px-4">
            <p className="text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Budget Tracker App. All rights reserved.
            </p>
            <div className="flex justify-center mt-4 space-x-4">
              <button 
                onClick={toggleTheme}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Video Modal */}
      {showDemoVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowDemoVideo(false)}>
          <div className="relative bg-white dark:bg-gray-800 p-2 rounded-lg w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute -top-10 right-0 text-white"
              onClick={() => setShowDemoVideo(false)}
              aria-label="Close video"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-w-16 aspect-h-9">
              {/* Placeholder for actual video */}
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded">
                <p className="text-gray-600 dark:text-gray-300">Video demo would play here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
