<template>
  <div>
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Hero Section -->
    <section class="pt-24 pb-16 bg-gradient-to-br from-green-50 to-blue-50">
      <div class="container mx-auto px-6">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-full text-green-600 text-sm font-semibold mb-8 border border-green-500/30">
              <Icon name="heroicons:wrench-screwdriver" class="w-5 h-5 mr-3" />
              Smart Solutions in Action
              <Icon name="heroicons:wrench-screwdriver" class="w-5 h-5 ml-3" />
            </div>
            
            <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              How DigiHub <span class="gradient-text">Solves</span> Your Problems
            </h1>
            <p class="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Discover the simple yet powerful ways DigiHub transforms your e-commerce challenges 
              into streamlined, automated solutions that save time and money.
            </p>
          </div>
          
          <!-- Problem Overview Grid -->
          <div class="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            <div class="bg-white rounded-2xl p-4 shadow-lg border border-red-100 text-center transform hover:scale-105 transition-all duration-300">
              <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="heroicons:puzzle-piece" class="w-8 h-8 text-red-600" />
              </div>
              <h3 class="text-sm font-bold text-red-800 mb-1">Channel Chaos</h3>
              <p class="text-xs text-red-600">Multiple dashboards</p>
            </div>
            
            <div class="bg-white rounded-2xl p-4 shadow-lg border border-yellow-100 text-center transform hover:scale-105 transition-all duration-300">
              <div class="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="heroicons:exclamation-triangle" class="w-8 h-8 text-yellow-600" />
              </div>
              <h3 class="text-sm font-bold text-yellow-800 mb-1">Overselling</h3>
              <p class="text-xs text-yellow-600">Stock mismatches</p>
            </div>
            
            <div class="bg-white rounded-2xl p-4 shadow-lg border border-orange-100 text-center transform hover:scale-105 transition-all duration-300">
              <div class="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="heroicons:clock" class="w-8 h-8 text-orange-600" />
              </div>
              <h3 class="text-sm font-bold text-orange-800 mb-1">Slow Processing</h3>
              <p class="text-xs text-orange-600">Manual workflows</p>
            </div>
            
            <div class="bg-white rounded-2xl p-4 shadow-lg border border-purple-100 text-center transform hover:scale-105 transition-all duration-300">
              <div class="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="heroicons:currency-dollar" class="w-8 h-8 text-purple-600" />
              </div>
              <h3 class="text-sm font-bold text-purple-800 mb-1">High Costs</h3>
              <p class="text-xs text-purple-600">No rate comparison</p>
            </div>
            
            <div class="bg-white rounded-2xl p-4 shadow-lg border border-cyan-100 text-center transform hover:scale-105 transition-all duration-300">
              <div class="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="heroicons:x-circle" class="w-8 h-8 text-cyan-600" />
              </div>
              <h3 class="text-sm font-bold text-cyan-800 mb-1">Data Errors</h3>
              <p class="text-xs text-cyan-600">Inconsistent info</p>
            </div>
            
            <div class="bg-white rounded-2xl p-4 shadow-lg border border-indigo-100 text-center transform hover:scale-105 transition-all duration-300">
              <div class="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="heroicons:eye-slash" class="w-8 h-8 text-indigo-600" />
              </div>
              <h3 class="text-sm font-bold text-indigo-800 mb-1">No Visibility</h3>
              <p class="text-xs text-indigo-600">Order tracking</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Solutions Grid -->
    <section class="py-20">
      <div class="container mx-auto px-6">
        <div class="space-y-24">
          
          <!-- Solution 1: Channel Fragmentation -->
          <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-24">
            <!-- Section Header with Image -->
            <div class="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white">
              <div class="flex items-center space-x-6">
                <div class="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:puzzle-piece" class="w-12 h-12 text-white" />
                </div>
                <div>
                  <h2 class="text-3xl font-bold mb-2">Channel Fragmentation Challenge</h2>
                  <p class="text-xl opacity-90">From Multiple Dashboards to Unified Control</p>
                </div>
              </div>
            </div>
            
            <div class="p-8 lg:p-12">
              <div class="grid lg:grid-cols-2 gap-12 items-center">
                <div class="order-2 lg:order-1">
                  <!-- The Problem -->
                  <div class="bg-gradient-to-br from-red-50 to-orange-50 border-l-4 border-red-500 rounded-2xl p-8 mb-10">
                    <div class="flex items-start space-x-4 mb-6">
                      <div class="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Icon name="heroicons:exclamation-triangle" class="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 class="text-2xl font-bold text-red-800 mb-3">The Problem: Channel Fragmentation</h3>
                        <p class="text-red-700 text-lg leading-relaxed mb-4">
                          Managing multiple e-commerce platforms requires constant switching between different dashboards, 
                          each with unique interfaces and processes. This fragmentation creates inefficiencies and errors.
                        </p>
                      </div>
                    </div>
                    
                    <!-- Impact Metrics -->
                    <div class="grid md:grid-cols-3 gap-4">
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-red-600 mb-1">80%</div>
                        <div class="text-red-700 text-sm">Time Wasted</div>
                      </div>
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-red-600 mb-1">5-8</div>
                        <div class="text-red-700 text-sm">Daily Logins</div>
                      </div>
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-red-600 mb-1">3x</div>
                        <div class="text-red-700 text-sm">More Errors</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- The Solution -->
                  <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-2xl p-8">
                    <div class="flex items-start space-x-4 mb-6">
                      <div class="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Icon name="heroicons:check-circle" class="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 class="text-2xl font-bold text-green-800 mb-3">DigiHub's Solution: Unified Dashboard</h3>
                        <p class="text-green-700 text-lg leading-relaxed mb-4">
                          Single dashboard connects all sales channels through secure API integrations. 
                          Centralized control with real-time synchronization across platforms.
                        </p>
                      </div>
                    </div>
                    
                    <!-- Key Features -->
                    <div class="grid md:grid-cols-2 gap-4 mb-6">
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:squares-plus" class="w-5 h-5 mr-2" />
                          Multi-Platform Dashboard
                        </div>
                        <p class="text-green-600 text-sm">All channels in one interface</p>
                      </div>
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:bolt" class="w-5 h-5 mr-2" />
                          Bulk Operations
                        </div>
                        <p class="text-green-600 text-sm">Update products across platforms instantly</p>
                      </div>
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:chart-bar" class="w-5 h-5 mr-2" />
                          Unified Analytics
                        </div>
                        <p class="text-green-600 text-sm">Complete performance overview</p>
                      </div>
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:shield-check" class="w-5 h-5 mr-2" />
                          Secure Integration
                        </div>
                        <p class="text-green-600 text-sm">Enterprise-grade API security</p>
                      </div>
                    </div>
                    
                    <!-- Result -->
                    <div class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white text-center">
                      <div class="flex items-center justify-center space-x-4">
                        <Icon name="heroicons:trophy" class="w-8 h-8" />
                        <div>
                          <div class="text-2xl font-bold">80% Time Reduction</div>
                          <div class="opacity-90">Operational efficiency improvement</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="order-1 lg:order-2">
                  <!-- Before/After Comparison -->
                  <div class="space-y-8">
                    <!-- Before -->
                    <div class="text-center">
                      <h4 class="text-xl font-bold text-red-600 mb-4">❌ BEFORE: Channel Chaos</h4>
                      <div class="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                        <div class="grid grid-cols-2 gap-3 mb-4">
                          <div class="bg-orange-400 rounded-lg p-3 text-white text-center text-sm font-bold">
                            SHOPIFY
                          </div>
                          <div class="bg-yellow-500 rounded-lg p-3 text-white text-center text-sm font-bold">
                            AMAZON
                          </div>
                          <div class="bg-blue-500 rounded-lg p-3 text-white text-center text-sm font-bold">
                            eBay
                          </div>
                          <div class="bg-purple-500 rounded-lg p-3 text-white text-center text-sm font-bold">
                            WooCommerce
                          </div>
                        </div>
                        <div class="text-red-600 text-sm">
                          Separate logins • Manual updates • No coordination
                        </div>
                      </div>
                    </div>
                    
                    <!-- Arrow -->
                    <div class="flex justify-center">
                      <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-green-500 rounded-full flex items-center justify-center">
                        <Icon name="heroicons:arrow-down" class="w-8 h-8 text-white animate-bounce" />
                      </div>
                    </div>
                    
                    <!-- After -->
                    <div class="text-center">
                      <h4 class="text-xl font-bold text-green-600 mb-4">✅ AFTER: DigiHub Control</h4>
                      <div class="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-4">
                          <Icon name="heroicons:squares-plus" class="w-12 h-12 mx-auto mb-2" />
                          <div class="font-bold text-lg">DigiHub Dashboard</div>
                        </div>
                        <div class="grid grid-cols-4 gap-2 mb-3">
                          <div class="w-full h-2 bg-orange-400 rounded"></div>
                          <div class="w-full h-2 bg-yellow-500 rounded"></div>
                          <div class="w-full h-2 bg-blue-500 rounded"></div>
                          <div class="w-full h-2 bg-purple-500 rounded"></div>
                        </div>
                        <div class="text-green-600 text-sm">
                          One login • Bulk updates • Perfect coordination
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Solution 2: Inventory Discrepancies -->
          <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-24">
            <!-- Section Header with Image -->
            <div class="bg-gradient-to-r from-yellow-500 to-red-500 p-8 text-white">
              <div class="flex items-center space-x-6">
                <div class="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-white" />
                </div>
                <div>
                  <h2 class="text-3xl font-bold mb-2">Inventory Chaos & Overselling</h2>
                  <p class="text-xl opacity-90">From Stock Nightmares to Perfect Synchronization</p>
                </div>
              </div>
            </div>
            
            <div class="p-8 lg:p-12">
              <div class="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <!-- Before/After Inventory Visualization -->
                  <div class="space-y-8">
                    <!-- Before -->
                    <div class="text-center">
                      <h4 class="text-xl font-bold text-red-600 mb-4">❌ BEFORE: Stock Chaos</h4>
                      <div class="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                        <div class="text-sm text-red-600 mb-4 font-bold">You have 10 units in stock</div>
                        <div class="grid grid-cols-2 gap-3 mb-4">
                          <div class="bg-orange-400 rounded-lg p-3 text-white text-center">
                            <div class="font-bold text-xs">SHOPIFY</div>
                            <div class="text-lg">10 units</div>
                          </div>
                          <div class="bg-yellow-500 rounded-lg p-3 text-white text-center">
                            <div class="font-bold text-xs">AMAZON</div>
                            <div class="text-lg">10 units</div>
                          </div>
                          <div class="bg-blue-500 rounded-lg p-3 text-white text-center">
                            <div class="font-bold text-xs">eBay</div>
                            <div class="text-lg">10 units</div>
                          </div>
                          <div class="bg-purple-500 rounded-lg p-3 text-white text-center">
                            <div class="font-bold text-xs">WooCommerce</div>
                            <div class="text-lg">10 units</div>
                          </div>
                        </div>
                        <div class="bg-red-200 rounded-lg p-3">
                          <div class="text-red-800 font-bold text-sm">Orders received: 15 units total!</div>
                          <div class="text-red-600 text-xs mt-1">5 units oversold = 5 angry customers</div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Arrow -->
                    <div class="flex justify-center">
                      <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-green-500 rounded-full flex items-center justify-center">
                        <Icon name="heroicons:arrow-down" class="w-8 h-8 text-white animate-bounce" />
                      </div>
                    </div>
                    
                    <!-- After -->
                    <div class="text-center">
                      <h4 class="text-xl font-bold text-green-600 mb-4">✅ AFTER: Perfect Sync</h4>
                      <div class="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                        <div class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white mb-4">
                          <Icon name="heroicons:arrow-path" class="w-8 h-8 mx-auto mb-2 animate-spin" />
                          <div class="font-bold">DigiHub Real-time Sync</div>
                        </div>
                        <div class="text-sm text-green-600 mb-2 font-bold">Sale happens on Amazon → Instant update everywhere</div>
                        <div class="grid grid-cols-4 gap-2 mb-3">
                          <div class="bg-green-400 text-white text-center py-2 rounded text-xs">9 units</div>
                          <div class="bg-green-400 text-white text-center py-2 rounded text-xs">9 units</div>
                          <div class="bg-green-400 text-white text-center py-2 rounded text-xs">9 units</div>
                          <div class="bg-green-400 text-white text-center py-2 rounded text-xs">9 units</div>
                        </div>
                        <div class="text-green-600 text-sm">
                          All platforms updated instantly • Zero overselling
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <!-- The Problem -->
                  <div class="bg-gradient-to-br from-yellow-50 to-red-50 border-l-4 border-yellow-500 rounded-2xl p-8 mb-10">
                    <div class="flex items-start space-x-4 mb-6">
                      <div class="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Icon name="heroicons:exclamation-triangle" class="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 class="text-2xl font-bold text-yellow-800 mb-3">The Problem: Inventory Overselling</h3>
                        <p class="text-yellow-700 text-lg leading-relaxed mb-4">
                          Multiple platforms operating in isolation leads to stock mismatches and overselling incidents. 
                          Inventory updates don't sync across channels, causing customer dissatisfaction and revenue loss.
                        </p>
                      </div>
                    </div>
                    
                    <!-- Impact Metrics -->
                    <div class="grid md:grid-cols-3 gap-4">
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-yellow-600 mb-1">95%</div>
                        <div class="text-yellow-700 text-sm">Sellers Experience This</div>
                      </div>
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-yellow-600 mb-1">30%</div>
                        <div class="text-yellow-700 text-sm">Lost Customers</div>
                      </div>
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-yellow-600 mb-1">$1000s</div>
                        <div class="text-yellow-700 text-sm">Revenue Lost</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- The Solution -->
                  <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-2xl p-8">
                    <div class="flex items-start space-x-4 mb-6">
                      <div class="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Icon name="heroicons:check-circle" class="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 class="text-2xl font-bold text-green-800 mb-3">DigiHub's Solution: Real-time Inventory Sync</h3>
                        <p class="text-green-700 text-lg leading-relaxed mb-4">
                          Real-time inventory synchronization across all platforms using webhooks and API integration. 
                          Instant stock updates prevent overselling and maintain accurate inventory levels.
                        </p>
                      </div>
                    </div>
                    
                    <!-- Key Features -->
                    <div class="grid md:grid-cols-2 gap-4 mb-6">
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:bolt" class="w-5 h-5 mr-2" />
                          Sub-Second Updates
                        </div>
                        <p class="text-green-600 text-sm">Instant synchronization</p>
                      </div>
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:shield-check" class="w-5 h-5 mr-2" />
                          Overselling Prevention
                        </div>
                        <p class="text-green-600 text-sm">Smart stock validation</p>
                      </div>
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:bell" class="w-5 h-5 mr-2" />
                          Low Stock Alerts
                        </div>
                        <p class="text-green-600 text-sm">Proactive notifications</p>
                      </div>
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:chart-line" class="w-5 h-5 mr-2" />
                          Demand Forecasting
                        </div>
                        <p class="text-green-600 text-sm">Predictive analytics</p>
                      </div>
                    </div>
                    
                    <!-- Result -->
                    <div class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white text-center">
                      <div class="flex items-center justify-center space-x-4">
                        <Icon name="heroicons:trophy" class="w-8 h-8" />
                        <div>
                          <div class="text-2xl font-bold">95% Reduction in Overselling</div>
                          <div class="opacity-90">Improved customer satisfaction</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Solution 3: Order Processing Delays -->
          <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-24">
            <!-- Section Header with Image -->
            <div class="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
              <div class="flex items-center space-x-6">
                <div class="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:clock" class="w-12 h-12 text-white" />
                </div>
                <div>
                  <h2 class="text-3xl font-bold mb-2">Order Processing Bottlenecks</h2>
                  <p class="text-xl opacity-90">From Manual Chaos to Automated Excellence</p>
                </div>
              </div>
            </div>
            
            <div class="p-8 lg:p-12">
              <div class="grid lg:grid-cols-2 gap-12 items-center">
                <div class="order-2 lg:order-1">
                  <!-- The Problem -->
                  <div class="bg-gradient-to-br from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-2xl p-8 mb-10">
                    <div class="flex items-start space-x-4 mb-6">
                      <div class="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Icon name="heroicons:clock" class="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 class="text-2xl font-bold text-orange-800 mb-3">The Problem: Manual Order Processing</h3>
                        <p class="text-orange-700 text-lg leading-relaxed mb-4">
                          Manual order processing requires multiple steps: payment verification, inventory checks, 
                          status updates, and customer notifications. This creates bottlenecks and delays.
                        </p>
                      </div>
                    </div>
                    
                    <!-- Impact Metrics -->
                    <div class="grid md:grid-cols-3 gap-4">
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-orange-600 mb-1">20min</div>
                        <div class="text-orange-700 text-sm">Per Order</div>
                      </div>
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-orange-600 mb-1">70%</div>
                        <div class="text-orange-700 text-sm">Staff Time Wasted</div>
                      </div>
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-orange-600 mb-1">5x</div>
                        <div class="text-orange-700 text-sm">More Errors</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- The Solution -->
                  <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-2xl p-8">
                    <div class="flex items-start space-x-4 mb-6">
                      <div class="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Icon name="heroicons:check-circle" class="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 class="text-2xl font-bold text-green-800 mb-3">DigiHub's Solution: Automated Order Processing</h3>
                        <p class="text-green-700 text-lg leading-relaxed mb-4">
                          Automated order processing pipeline handles validation, confirmation, routing, and shipping 
                          without manual intervention. Reduces processing time from 20 minutes to 2 minutes per order.
                        </p>
                      </div>
                    </div>
                    
                    <!-- Key Features -->
                    <div class="grid md:grid-cols-2 gap-4 mb-6">
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:bolt" class="w-5 h-5 mr-2" />
                          Zero-Touch Processing
                        </div>
                        <p class="text-green-600 text-sm">95% of orders need no manual intervention</p>
                      </div>
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:envelope" class="w-5 h-5 mr-2" />
                          Smart Notifications
                        </div>
                        <p class="text-green-600 text-sm">Automated customer communications</p>
                      </div>
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:truck" class="w-5 h-5 mr-2" />
                          Intelligent Routing
                        </div>
                        <p class="text-green-600 text-sm">Orders sent to best fulfillment location</p>
                      </div>
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:shield-check" class="w-5 h-5 mr-2" />
                          Error Prevention
                        </div>
                        <p class="text-green-600 text-sm">Built-in validation and quality checks</p>
                      </div>
                    </div>
                    
                    <!-- Result -->
                    <div class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white text-center">
                      <div class="flex items-center justify-center space-x-4">
                        <Icon name="heroicons:trophy" class="w-8 h-8" />
                        <div>
                          <div class="text-2xl font-bold">90% Faster Processing</div>
                          <div class="opacity-90">Automated workflow efficiency</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="order-1 lg:order-2">
                  <!-- Processing Speed Comparison -->
                  <div class="space-y-8">
                    <!-- Manual Processing -->
                    <div class="text-center">
                      <h4 class="text-xl font-bold text-red-600 mb-4">❌ BEFORE: Manual Processing</h4>
                      <div class="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                        <div class="space-y-3">
                          <div class="bg-red-200 rounded-lg p-3">
                            <div class="text-red-800 font-bold text-sm">1 Order = 20 Minutes</div>
                          </div>
                          <div class="grid grid-cols-1 gap-2">
                            <div class="bg-orange-300 rounded p-2 text-white text-xs">Check Details (3min)</div>
                            <div class="bg-orange-400 rounded p-2 text-white text-xs">Verify Payment (4min)</div>
                            <div class="bg-orange-500 rounded p-2 text-white text-xs">Send Email (2min)</div>
                            <div class="bg-red-400 rounded p-2 text-white text-xs">Update Status (2min)</div>
                            <div class="bg-red-500 rounded p-2 text-white text-xs">Create Label (4min)</div>
                            <div class="bg-red-600 rounded p-2 text-white text-xs">Manual Errors (5min)</div>
                          </div>
                        </div>
                        <div class="text-red-600 text-sm mt-3">
                          Staff exhaustion • Errors • Delays
                        </div>
                      </div>
                    </div>
                    
                    <!-- Arrow -->
                    <div class="flex justify-center">
                      <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-green-500 rounded-full flex items-center justify-center">
                        <Icon name="heroicons:arrow-down" class="w-8 h-8 text-white animate-bounce" />
                      </div>
                    </div>
                    
                    <!-- Automated Processing -->
                    <div class="text-center">
                      <h4 class="text-xl font-bold text-green-600 mb-4">✅ AFTER: Automated Flow</h4>
                      <div class="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                        <div class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white mb-4">
                          <Icon name="heroicons:cog-6-tooth" class="w-8 h-8 mx-auto mb-2 animate-spin" />
                          <div class="font-bold">DigiHub Automation</div>
                        </div>
                        <div class="space-y-2">
                          <div class="bg-green-200 rounded-lg p-3">
                            <div class="text-green-800 font-bold text-sm">1 Order = 2 Minutes</div>
                          </div>
                          <div class="bg-green-400 rounded p-2 text-white text-xs">Instant validation & confirmation</div>
                          <div class="bg-green-500 rounded p-2 text-white text-xs">Automated email & routing</div>
                          <div class="bg-green-600 rounded p-2 text-white text-xs">Smart fulfillment dispatch</div>
                        </div>
                        <div class="text-green-600 text-sm mt-3">
                          Zero errors • Happy customers • Scalable
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Solution 4: Shipping Complexity -->
          <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-24">
            <!-- Section Header with Image -->
            <div class="bg-gradient-to-r from-purple-500 to-indigo-500 p-8 text-white">
              <div class="flex items-center space-x-6">
                <div class="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:currency-dollar" class="w-12 h-12 text-white" />
                </div>
                <div>
                  <h2 class="text-3xl font-bold mb-2">Shipping Cost Complexity</h2>
                  <p class="text-xl opacity-90">From Manual Rate Hunting to Intelligent Optimization</p>
                </div>
              </div>
            </div>
            
            <div class="p-8 lg:p-12">
              <div class="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <!-- Shipping Rate Comparison Visual -->
                  <div class="space-y-8">
                    <!-- Manual Rate Checking -->
                    <div class="text-center">
                      <h4 class="text-xl font-bold text-red-600 mb-4">❌ BEFORE: Rate Hunting Nightmare</h4>
                      <div class="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                        <div class="text-sm text-red-600 mb-4 font-bold">For 1 shipment to Mumbai:</div>
                        <div class="grid grid-cols-1 gap-3 mb-4">
                          <div class="bg-blue-400 rounded-lg p-3 text-white text-center">
                            <div class="font-bold text-xs">BlueDart Website</div>
                            <div class="text-sm">₹150 (5 min to check)</div>
                          </div>
                          <div class="bg-orange-400 rounded-lg p-3 text-white text-center">
                            <div class="font-bold text-xs">DTDC Portal</div>
                            <div class="text-sm">₹130 (4 min to check)</div>
                          </div>
                          <div class="bg-green-400 rounded-lg p-3 text-white text-center">
                            <div class="font-bold text-xs">Delhivery Dashboard</div>
                            <div class="text-sm">₹120 (6 min to check)</div>
                          </div>
                        </div>
                        <div class="bg-red-200 rounded-lg p-3">
                          <div class="text-red-800 font-bold text-sm">15 minutes wasted per shipment!</div>
                          <div class="text-red-600 text-xs mt-1">Often pick the first option due to time pressure</div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Arrow -->
                    <div class="flex justify-center">
                      <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-green-500 rounded-full flex items-center justify-center">
                        <Icon name="heroicons:arrow-down" class="w-8 h-8 text-white animate-bounce" />
                      </div>
                    </div>
                    
                    <!-- Automated Rate Optimization -->
                    <div class="text-center">
                      <h4 class="text-xl font-bold text-green-600 mb-4">✅ AFTER: Smart Rate Optimization</h4>
                      <div class="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                        <div class="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-4 text-white mb-4">
                          <Icon name="heroicons:truck" class="w-8 h-8 mx-auto mb-2" />
                          <div class="font-bold">DigiHub Rate Engine</div>
                        </div>
                        <div class="text-sm text-green-600 mb-3 font-bold">Instant comparison for Mumbai shipment:</div>
                        <div class="grid grid-cols-3 gap-2 mb-3">
                          <div class="bg-gray-300 text-gray-600 text-center py-2 rounded text-xs">₹150</div>
                          <div class="bg-gray-300 text-gray-600 text-center py-2 rounded text-xs">₹130</div>
                          <div class="bg-green-500 text-white text-center py-2 rounded text-xs font-bold">₹120 ✓</div>
                        </div>
                        <div class="text-green-600 text-sm">
                          Best rate chosen automatically • 2 seconds • ₹30 saved
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <!-- The Problem -->
                  <div class="bg-gradient-to-br from-purple-50 to-indigo-50 border-l-4 border-purple-500 rounded-2xl p-8 mb-10">
                    <div class="flex items-start space-x-4 mb-6">
                      <div class="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Icon name="heroicons:currency-dollar" class="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 class="text-2xl font-bold text-purple-800 mb-3">The Problem: Manual Rate Comparison</h3>
                        <p class="text-purple-700 text-lg leading-relaxed mb-4">
                          Manual rate checking across multiple carrier websites is time-consuming and often results 
                          in suboptimal shipping choices. Lack of real-time comparison leads to higher costs.
                        </p>
                      </div>
                    </div>
                    
                    <!-- Impact Metrics -->
                    <div class="grid md:grid-cols-3 gap-4">
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-purple-600 mb-1">40%</div>
                        <div class="text-purple-700 text-sm">Higher Costs</div>
                      </div>
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-purple-600 mb-1">15min</div>
                        <div class="text-purple-700 text-sm">Per Shipment</div>
                      </div>
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-purple-600 mb-1">5</div>
                        <div class="text-purple-700 text-sm">Websites to Check</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- The Solution -->
                  <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-2xl p-8">
                    <div class="flex items-start space-x-4 mb-6">
                      <div class="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Icon name="heroicons:check-circle" class="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 class="text-2xl font-bold text-green-800 mb-3">DigiHub's Solution: Automated Rate Optimization</h3>
                        <p class="text-green-700 text-lg leading-relaxed mb-4">
                          Real-time rate comparison across multiple carriers with automatic selection based on 
                          cost, speed, and reliability factors. Reduces shipping costs by 20-40%.
                        </p>
                      </div>
                    </div>
                    
                    <!-- Key Features -->
                    <div class="grid md:grid-cols-2 gap-4 mb-6">
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:calculator" class="w-5 h-5 mr-2" />
                          Multi-Carrier Comparison
                        </div>
                        <p class="text-green-600 text-sm">BlueDart, DTDC, Delhivery, and more</p>
                      </div>
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:clock" class="w-5 h-5 mr-2" />
                          2-Second Decisions
                        </div>
                        <p class="text-green-600 text-sm">From 15 minutes to 2 seconds</p>
                      </div>
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:banknotes" class="w-5 h-5 mr-2" />
                          Cost Optimization
                        </div>
                        <p class="text-green-600 text-sm">Save 20-40% on shipping costs</p>
                      </div>
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:chart-bar" class="w-5 h-5 mr-2" />
                          Performance Analytics
                        </div>
                        <p class="text-green-600 text-sm">Track delivery performance by carrier</p>
                      </div>
                    </div>
                    
                    <!-- Result -->
                    <div class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white text-center">
                      <div class="flex items-center justify-center space-x-4">
                        <Icon name="heroicons:trophy" class="w-8 h-8" />
                        <div>
                        <div class="text-2xl font-bold">40% Shipping Cost Savings</div>
                        <div class="opacity-90">Automated rate optimization</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Solution 5: Data Inconsistency -->
          <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-24">
            <div class="bg-gradient-to-r from-cyan-500 to-blue-500 p-8 text-white">
              <div class="flex items-center space-x-6">
                <div class="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:x-circle" class="w-12 h-12 text-white" />
                </div>
                <div>
                  <h2 class="text-3xl font-bold mb-2">Data Inconsistency Crisis</h2>
                  <p class="text-xl opacity-90">From Information Chaos to Perfect Harmony</p>
                </div>
              </div>
            </div>
            
            <div class="p-8 lg:p-12">
              <div class="grid lg:grid-cols-2 gap-12 items-center">
                <div class="order-2 lg:order-1">
                  <div class="bg-gradient-to-br from-cyan-50 to-blue-50 border-l-4 border-cyan-500 rounded-2xl p-8 mb-10">
                    <h3 class="text-2xl font-bold text-cyan-800 mb-4">The Problem: Data Inconsistency</h3>
                    <p class="text-cyan-700 text-lg mb-6">
                      Inconsistent product information, pricing, and customer data across platforms 
                      creates confusion and errors. Manual updates lead to data mismatches.
                    </p>
                    <div class="grid md:grid-cols-3 gap-4">
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-cyan-600 mb-1">70%</div>
                        <div class="text-cyan-700 text-sm">More Errors</div>
                      </div>
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-cyan-600 mb-1">5x</div>
                        <div class="text-cyan-700 text-sm">Customer Complaints</div>
                      </div>
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-cyan-600 mb-1">30%</div>
                        <div class="text-cyan-700 text-sm">Lost Sales</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-2xl p-8">
                    <h3 class="text-2xl font-bold text-green-800 mb-4">DigiHub's Solution: Data Synchronization</h3>
                    <p class="text-green-700 text-lg mb-6">
                      Centralized data management with real-time synchronization across all platforms. 
                      Single source of truth ensures 99.9% data accuracy.
                    </p>
                    <div class="grid md:grid-cols-2 gap-4 mb-6">
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:shield-check" class="w-5 h-5 mr-2" />
                          Real-time Validation
                        </div>
                        <p class="text-green-600 text-sm">Automatic error detection & fixing</p>
                      </div>
                      <div class="bg-white/60 rounded-xl p-4">
                        <div class="flex items-center text-green-600 font-medium mb-2">
                          <Icon name="heroicons:arrow-path" class="w-5 h-5 mr-2" />
                          Instant Sync
                        </div>
                        <p class="text-green-600 text-sm">Updates everywhere simultaneously</p>
                      </div>
                    </div>
                    <div class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white text-center">
                      <div class="flex items-center justify-center space-x-4">
                        <Icon name="heroicons:trophy" class="w-6 h-6" />
                        <span class="font-bold">99.9% Data Accuracy</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="order-1 lg:order-2">
                  <div class="space-y-8">
                    <div class="text-center">
                      <h4 class="text-xl font-bold text-red-600 mb-4">❌ BEFORE: Data Chaos</h4>
                      <div class="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                        <div class="grid grid-cols-1 gap-3">
                          <div class="bg-orange-400 rounded-lg p-3 text-white text-center">
                            <div class="font-bold text-xs">SHOPIFY</div>
                            <div class="text-sm">₹500 | 10 units | Wrong address</div>
                          </div>
                          <div class="bg-yellow-500 rounded-lg p-3 text-white text-center">
                            <div class="font-bold text-xs">AMAZON</div>
                            <div class="text-sm">₹550 | 8 units | Old phone</div>
                          </div>
                          <div class="bg-blue-500 rounded-lg p-3 text-white text-center">
                            <div class="font-bold text-xs">eBay</div>
                            <div class="text-sm">₹520 | 12 units | Missing email</div>
                          </div>
                        </div>
                        <div class="text-red-600 text-sm mt-3">Different data everywhere • Constant errors</div>
                      </div>
                    </div>
                    
                    <div class="flex justify-center">
                      <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-green-500 rounded-full flex items-center justify-center">
                        <Icon name="heroicons:arrow-down" class="w-8 h-8 text-white animate-bounce" />
                      </div>
                    </div>
                    
                    <div class="text-center">
                      <h4 class="text-xl font-bold text-green-600 mb-4">✅ AFTER: Perfect Sync</h4>
                      <div class="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                        <div class="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-4 text-white mb-4">
                          <Icon name="heroicons:shield-check" class="w-8 h-8 mx-auto mb-2" />
                          <div class="font-bold">DigiHub Data Sync</div>
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                          <div class="bg-green-400 text-white text-center py-2 rounded text-xs">₹500</div>
                          <div class="bg-green-400 text-white text-center py-2 rounded text-xs">₹500</div>
                          <div class="bg-green-400 text-white text-center py-2 rounded text-xs">₹500</div>
                        </div>
                        <div class="text-green-600 text-sm mt-3">Identical data everywhere • Zero errors</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Solution 6: Limited Visibility -->
          <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-24">
            <div class="bg-gradient-to-r from-indigo-500 to-purple-500 p-8 text-white">
              <div class="flex items-center space-x-6">
                <div class="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:eye-slash" class="w-12 h-12 text-white" />
                </div>
                <div>
                  <h2 class="text-3xl font-bold mb-2">Limited Order Visibility</h2>
                  <p class="text-xl opacity-90">From Flying Blind to Crystal Clear Tracking</p>
                </div>
              </div>
            </div>
            
            <div class="p-8 lg:p-12">
              <div class="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div class="space-y-8">
                    <div class="text-center">
                      <h4 class="text-xl font-bold text-red-600 mb-4">❌ BEFORE: Flying Blind</h4>
                      <div class="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                        <div class="space-y-3">
                          <div class="bg-gray-400 rounded-lg p-3 text-white text-center">
                            <div class="font-bold text-sm">Order #1234</div>
                            <div class="text-xs">Status: Unknown 🤷‍♂️</div>
                          </div>
                          <div class="bg-gray-500 rounded-lg p-3 text-white text-center">
                            <div class="font-bold text-sm">Order #1235</div>
                            <div class="text-xs">Location: ??? 📍</div>
                          </div>
                          <div class="bg-gray-600 rounded-lg p-3 text-white text-center">
                            <div class="font-bold text-sm">Order #1236</div>
                            <div class="text-xs">ETA: No idea ⏰</div>
                          </div>
                        </div>
                        <div class="text-red-600 text-sm mt-3">Constant customer calls • No visibility</div>
                      </div>
                    </div>
                    
                    <div class="flex justify-center">
                      <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-green-500 rounded-full flex items-center justify-center">
                        <Icon name="heroicons:arrow-down" class="w-8 h-8 text-white animate-bounce" />
                      </div>
                    </div>
                    
                    <div class="text-center">
                      <h4 class="text-xl font-bold text-green-600 mb-4">✅ AFTER: Complete Visibility</h4>
                      <div class="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                        <div class="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 text-white mb-4">
                          <Icon name="heroicons:eye" class="w-8 h-8 mx-auto mb-2" />
                          <div class="font-bold">DigiHub Tracking</div>
                        </div>
                        <div class="space-y-2">
                          <div class="bg-green-400 text-white text-center py-2 rounded text-xs">Order #1234 → Delivered ✅</div>
                          <div class="bg-blue-400 text-white text-center py-2 rounded text-xs">Order #1235 → In Transit 🚚</div>
                          <div class="bg-yellow-400 text-white text-center py-2 rounded text-xs">Order #1236 → Preparing 📦</div>
                        </div>
                        <div class="text-green-600 text-sm mt-3">Real-time updates • Happy customers</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div class="bg-gradient-to-br from-indigo-50 to-purple-50 border-l-4 border-indigo-500 rounded-2xl p-8 mb-10">
                    <h3 class="text-2xl font-bold text-indigo-800 mb-4">The Problem: Limited Visibility</h3>
                    <p class="text-indigo-700 text-lg mb-6">
                      Lack of real-time order tracking across multiple carriers and platforms. 
                      Manual status checking leads to customer inquiries and dissatisfaction.
                    </p>
                    <div class="grid md:grid-cols-3 gap-4">
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-indigo-600 mb-1">20+</div>
                        <div class="text-indigo-700 text-sm">Daily Calls</div>
                      </div>
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-indigo-600 mb-1">90%</div>
                        <div class="text-indigo-700 text-sm">Time Guessing</div>
                      </div>
                      <div class="text-center bg-white/60 rounded-xl p-4">
                        <div class="text-2xl font-black text-indigo-600 mb-1">5+</div>
                        <div class="text-indigo-700 text-sm">Websites to Check</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-2xl p-8">
                    <h3 class="text-2xl font-bold text-green-800 mb-4">DigiHub's Solution: Real-time Tracking</h3>
                    <p class="text-green-700 text-lg mb-6">
                      Unified tracking dashboard with real-time status updates across all carriers. 
                      Automated customer notifications and 5-stage visibility timeline.
                    </p>
                    <div class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white text-center">
                      <div class="flex items-center justify-center space-x-4">
                        <Icon name="heroicons:trophy" class="w-6 h-6" />
                        <span class="font-bold">95% Reduction in Status Inquiries</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Success Summary -->
    <section class="py-20 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
      <div class="container mx-auto px-6">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-4xl md:text-5xl font-bold mb-8">
            The Result? Your Business Transformed
          </h2>
          <p class="text-xl mb-12 opacity-90">
            When all these solutions work together, you get a business that runs smoothly, 
            saves money, and makes customers happy - all with less work from you.
          </p>
          
          <div class="grid md:grid-cols-3 gap-8 mb-12">
            <div class="text-center">
              <div class="text-4xl font-black mb-2">70%</div>
              <div class="text-lg">Less Manual Work</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-black mb-2">40%</div>
              <div class="text-lg">Lower Shipping Costs</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-black mb-2">90%</div>
              <div class="text-lg">Happier Customers</div>
            </div>
          </div>
          
          <NuxtLink to="/contact" class="inline-flex items-center px-8 py-4 bg-white text-green-600 rounded-2xl font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-2xl">
            <Icon name="heroicons:chat-bubble-left-right" class="w-6 h-6 mr-3" />
            Let's Solve Your Problems Too
            <Icon name="heroicons:arrow-right" class="w-6 h-6 ml-3" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup>
// SEO Meta
useHead({
  title: 'How DigiHub Solves E-commerce Problems - Simple Solutions Explained',
  meta: [
    {
      name: 'description',
      content: 'Discover how DigiHub solves common e-commerce challenges like channel fragmentation, inventory issues, and shipping complexity with simple, automated solutions that save time and money.'
    },
    {
      property: 'og:title',
      content: 'How DigiHub Solves E-commerce Problems - Simple Solutions Explained'
    },
    {
      property: 'og:description',
      content: 'See how DigiHub transforms e-commerce chaos into streamlined success with automated solutions for multi-channel management, inventory sync, and smart shipping.'
    }
  ]
})
</script>
