<template>
  <div>
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Hero Section -->
    <section class="py-32 bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"></div>
      <div class="absolute top-32 left-16 w-72 h-72 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-32 right-16 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
      
      <div class="container mx-auto px-6 relative z-10">
        <div class="text-center max-w-4xl mx-auto">
          <div class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-full text-cyan-400 text-sm font-semibold mb-8 border border-cyan-400/30">
            <Icon name="heroicons:eye" class="w-5 h-5 mr-3" />
            Real-time Tracking
            <Icon name="heroicons:map-pin" class="w-5 h-5 ml-3" />
          </div>
          
          <h1 class="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
            <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Complete Order
            </span>
            <span class="block text-4xl md:text-5xl font-light mt-4 text-gray-300">
              Visibility & Tracking
            </span>
          </h1>
          
          <p class="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
            Achieve <span class="text-cyan-400 font-semibold">90% improvement</span> in order visibility with 
            comprehensive 5-stage tracking and real-time notifications.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-6 justify-center">
            <button class="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-white font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25">
              <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative flex items-center justify-center">
                <Icon name="heroicons:magnifying-glass" class="w-6 h-6 mr-3" />
                Track Order
              </div>
            </button>
            
            <button class="group px-8 py-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:bg-white/10 hover:border-cyan-400/50">
              <div class="flex items-center justify-center">
                <Icon name="heroicons:bell" class="w-6 h-6 mr-3 group-hover:text-cyan-400 transition-colors" />
                Setup Alerts
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 5-Stage Tracking Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">5-Stage Tracking Timeline</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tracking system providing complete visibility from booking to delivery
          </p>
        </div>
        
        <div class="max-w-6xl mx-auto">
          <div class="relative">
            <!-- Progress Line -->
            <div class="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2"></div>
            <div class="absolute top-1/2 left-0 w-3/5 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transform -translate-y-1/2"></div>
            
            <div class="grid grid-cols-5 gap-4">
              <!-- Stage 1: Booked -->
              <div class="text-center relative">
                <div class="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 mx-auto relative z-10 shadow-lg">
                  ✓
                </div>
                <div class="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                  <div class="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Icon name="heroicons:document-check" class="w-5 h-5 text-cyan-600" />
                  </div>
                  <h3 class="text-lg font-bold text-gray-900 mb-2">Booked</h3>
                  <p class="text-gray-600 text-sm">Order confirmed and AWB generated</p>
                  <div class="text-green-600 text-xs font-semibold mt-2">✅ Complete</div>
                </div>
              </div>
              
              <!-- Stage 2: Ready to Ship -->
              <div class="text-center relative">
                <div class="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 mx-auto relative z-10 shadow-lg">
                  ✓
                </div>
                <div class="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Icon name="heroicons:cube" class="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 class="text-lg font-bold text-gray-900 mb-2">Ready to Ship</h3>
                  <p class="text-gray-600 text-sm">Package prepared and ready for pickup</p>
                  <div class="text-green-600 text-xs font-semibold mt-2">✅ Complete</div>
                </div>
              </div>
              
              <!-- Stage 3: In-Transit -->
              <div class="text-center relative">
                <div class="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 mx-auto relative z-10 shadow-lg animate-pulse">
                  ⏳
                </div>
                <div class="bg-white rounded-2xl p-4 shadow-lg border border-yellow-200">
                  <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Icon name="heroicons:truck" class="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 class="text-lg font-bold text-gray-900 mb-2">In-Transit</h3>
                  <p class="text-gray-600 text-sm">Package in carrier network</p>
                  <div class="text-yellow-600 text-xs font-semibold mt-2">⏳ Current</div>
                </div>
              </div>
              
              <!-- Stage 4: Out for Delivery -->
              <div class="text-center relative">
                <div class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg mb-4 mx-auto relative z-10">
                  4
                </div>
                <div class="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                  <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Icon name="heroicons:home" class="w-5 h-5 text-gray-500" />
                  </div>
                  <h3 class="text-lg font-bold text-gray-900 mb-2">Out for Delivery</h3>
                  <p class="text-gray-600 text-sm">Package out for final delivery</p>
                  <div class="text-gray-500 text-xs font-semibold mt-2">⏸️ Pending</div>
                </div>
              </div>
              
              <!-- Stage 5: Delivered -->
              <div class="text-center relative">
                <div class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg mb-4 mx-auto relative z-10">
                  5
                </div>
                <div class="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                  <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Icon name="heroicons:check-circle" class="w-5 h-5 text-gray-500" />
                  </div>
                  <h3 class="text-lg font-bold text-gray-900 mb-2">Delivered</h3>
                  <p class="text-gray-600 text-sm">Package successfully delivered</p>
                  <div class="text-gray-500 text-xs font-semibold mt-2">⏸️ Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tracking Features Section -->
    <section class="py-32 bg-gradient-to-br from-gray-900 to-black">
      <div class="container mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-5xl font-bold text-white mb-6">Advanced Tracking Features</h2>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive tracking capabilities with real-time updates and intelligent notifications
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <!-- Feature Cards -->
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:bolt" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Real-time Updates</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Live tracking updates without page refresh with push notifications for status changes and delivery milestones.
            </p>
            <div class="text-cyan-400 font-semibold">Instant Notifications</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:magnifying-glass" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Multi-Search Options</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Search by order ID, AWB number, phone number, or customer details for flexible tracking access.
            </p>
            <div class="text-green-400 font-semibold">Flexible Search</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:map" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Location Mapping</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              GPS-based location tracking with interactive maps showing current package location and delivery route.
            </p>
            <div class="text-purple-400 font-semibold">GPS Integration</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:clock" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Delivery Estimation</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Dynamic delivery time estimation based on real-time carrier data and historical performance analytics.
            </p>
            <div class="text-orange-400 font-semibold">Smart Predictions</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:document-arrow-down" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Download Reports</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Download detailed tracking reports, delivery proof, and comprehensive shipment history documentation.
            </p>
            <div class="text-pink-400 font-semibold">Detailed Reports</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:chat-bubble-left-right" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Support Integration</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Direct access to customer support with feedback system and rating capabilities for service quality.
            </p>
            <div class="text-indigo-400 font-semibold">Integrated Support</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Notification Channels Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Multi-Channel Notifications</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Keep customers informed through multiple communication channels with automated notifications
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          <!-- Notification Channels -->
          <div class="text-center">
            <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Icon name="heroicons:computer-desktop" class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Web Portal</h3>
            <p class="text-gray-600 text-sm">Customer dashboard with real-time tracking interface</p>
          </div>
          
          <div class="text-center">
            <div class="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Icon name="heroicons:device-phone-mobile" class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Mobile App</h3>
            <p class="text-gray-600 text-sm">Native mobile application with push notifications</p>
          </div>
          
          <div class="text-center">
            <div class="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Icon name="heroicons:chat-bubble-bottom-center-text" class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">SMS Alerts</h3>
            <p class="text-gray-600 text-sm">Instant SMS notifications for status updates</p>
          </div>
          
          <div class="text-center">
            <div class="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Icon name="heroicons:envelope" class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Email Updates</h3>
            <p class="text-gray-600 text-sm">Detailed email reports with tracking information</p>
          </div>
          
          <div class="text-center">
            <div class="w-20 h-20 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Icon name="heroicons:chat-bubble-oval-left" class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">WhatsApp Bot</h3>
            <p class="text-gray-600 text-sm">Interactive WhatsApp bot for tracking queries</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Event Tracking Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Detailed Event Tracking</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive event logging with chronological timeline and detailed location information
          </p>
        </div>
        
        <div class="max-w-4xl mx-auto">
          <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <div class="space-y-6">
              <!-- Event Timeline -->
              <div class="flex items-start">
                <div class="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full mt-2 mr-6"></div>
                <div class="flex-grow">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-bold text-gray-900">Package Arrived at Delhi Hub</h3>
                    <span class="text-gray-500 text-sm">2025-08-05 09:45:55</span>
                  </div>
                  <p class="text-gray-600 mb-2">Order has arrived at the pickup warehouse</p>
                  <div class="flex items-center text-sm text-gray-500">
                    <Icon name="heroicons:map-pin" class="w-4 h-4 mr-1" />
                    <span class="mr-4">Delhi</span>
                    <Icon name="heroicons:truck" class="w-4 h-4 mr-1" />
                    <span>Surface Transport</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full mt-2 mr-6"></div>
                <div class="flex-grow">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-bold text-gray-900">Package Dispatched</h3>
                    <span class="text-gray-500 text-sm">2025-08-04 14:30:22</span>
                  </div>
                  <p class="text-gray-600 mb-2">Package dispatched from origin hub</p>
                  <div class="flex items-center text-sm text-gray-500">
                    <Icon name="heroicons:map-pin" class="w-4 h-4 mr-1" />
                    <span class="mr-4">Mumbai</span>
                    <Icon name="heroicons:truck" class="w-4 h-4 mr-1" />
                    <span>Surface Transport</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex-shrink-0 w-4 h-4 bg-yellow-500 rounded-full mt-2 mr-6"></div>
                <div class="flex-grow">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-bold text-gray-900">Package Picked Up</h3>
                    <span class="text-gray-500 text-sm">2025-08-04 10:15:30</span>
                  </div>
                  <p class="text-gray-600 mb-2">Package collected from merchant location</p>
                  <div class="flex items-center text-sm text-gray-500">
                    <Icon name="heroicons:map-pin" class="w-4 h-4 mr-1" />
                    <span class="mr-4">Mumbai</span>
                    <Icon name="heroicons:building-office" class="w-4 h-4 mr-1" />
                    <span>Pickup Location</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex-shrink-0 w-4 h-4 bg-gray-400 rounded-full mt-2 mr-6"></div>
                <div class="flex-grow">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-bold text-gray-900">Order Booked</h3>
                    <span class="text-gray-500 text-sm">2025-08-04 08:00:00</span>
                  </div>
                  <p class="text-gray-600 mb-2">Order confirmed and AWB generated</p>
                  <div class="flex items-center text-sm text-gray-500">
                    <Icon name="heroicons:document-text" class="w-4 h-4 mr-1" />
                    <span>AWB: DH12345678</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Performance Metrics -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Tracking Performance</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Industry-leading tracking capabilities with measurable customer satisfaction improvements
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-5xl font-bold text-cyan-600 mb-2">90%</div>
            <div class="text-gray-600 font-medium">Visibility Improvement</div>
            <div class="text-gray-500 text-sm mt-1">Customer satisfaction</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-green-600 mb-2">5-Stage</div>
            <div class="text-gray-600 font-medium">Tracking Timeline</div>
            <div class="text-gray-500 text-sm mt-1">Complete journey</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-blue-600 mb-2">Real-time</div>
            <div class="text-gray-600 font-medium">Status Updates</div>
            <div class="text-gray-500 text-sm mt-1">Live notifications</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-purple-600 mb-2">5+</div>
            <div class="text-gray-600 font-medium">Notification Channels</div>
            <div class="text-gray-500 text-sm mt-1">Multi-channel alerts</div>
          </div>
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
  title: 'Real-time Tracking - DigiHub Order Visibility Platform',
  meta: [
    {
      name: 'description',
      content: 'Achieve 90% improvement in order visibility with comprehensive 5-stage tracking. Real-time updates, GPS location mapping, and multi-channel notifications for complete shipment transparency.'
    }
  ]
})
</script>
