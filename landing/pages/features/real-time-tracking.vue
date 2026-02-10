<template>
  <div class="bg-black min-h-screen">
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 overflow-hidden">
        <!-- Background -->
        <div class="absolute inset-0 bg-black">
             <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-900/20 via-black to-black"></div>
             <!-- Cyber Grid -->
             <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(#ec4899 1px, transparent 1px), linear-gradient(90deg, #ec4899 1px, transparent 1px); background-size: 50px 50px; transform: perspective(100vh) rotateX(60deg) translateY(-100px) scale(2);"></div>
        </div>

        <div class="container mx-auto px-6 relative z-10 text-center">
             <div class="inline-flex items-center px-4 py-2 bg-pink-900/30 border border-pink-500/30 rounded-full text-pink-400 text-sm font-semibold mb-8 backdrop-blur-md">
                <Icon name="heroicons:map-pin" class="w-5 h-5 mr-2" />
                <span>End-to-End Visibility</span>
            </div>

            <h1 class="text-5xl md:text-8xl font-black text-white mb-8 tracking-tight">
                Branded <br />
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-blue-500">Tracking</span>
            </h1>

            <p class="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                Don't send customers to carrier sites. Keep them engaged with a generic, white-labeled tracking page that drives <span class="text-pink-400 font-bold">30% more repeat sales</span>.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-6 justify-center">
                <button class="px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_40px_rgba(236,72,153,0.5)]">
                    Create Tracking Page
                </button>
                 <button class="px-8 py-4 bg-slate-900 border border-slate-700 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center group">
                    <Icon name="heroicons:chat-bubble-left-right" class="w-5 h-5 mr-2 text-pink-500 group-hover:scale-110 transition-transform" />
                    Preview Notifications
                </button>
            </div>
        </div>
    </section>

    <!-- Tracking Experience Demo -->
    <section class="py-24 bg-slate-900/30 border-t border-slate-800">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-white mb-4">The Customer Experience</h2>
          <p class="text-gray-400">Turn anxiety into anticipation.</p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
           <!-- Mobile Mockup -->
           <div class="relative mx-auto border-gray-800 bg-gray-900 border-[8px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col overflow-hidden">
                <div class="h-[32px] bg-gray-800 w-full absolute top-0 left-0 rounded-t-[2.5rem] z-20"></div>
                <div class="flex-1 bg-black text-white overflow-y-auto pt-10 px-4 relative z-10 scrollbar-hide">
                    <!-- Fake Tracking Page UI -->
                    <div class="flex justify-between items-center mb-6">
                         <div class="text-lg font-bold">BRAND_LOGO</div>
                         <Icon name="heroicons:bars-3" class="w-6 h-6" />
                    </div>
                    <div class="text-center mb-6">
                        <div class="text-sm text-gray-400">Arriving Tomorrow</div>
                        <div class="text-2xl font-bold text-green-400">Out for Delivery</div>
                        <p class="text-xs text-gray-500 mt-1">Courier: Bluedart | AWB: 123456789</p>
                    </div>
                    
                    <!-- Progress Bar -->
                    <div class="relative py-4 pl-4 border-l-2 border-slate-800 space-y-8 ml-2">
                        <div class="relative">
                             <div class="absolute -left-[21px] top-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
                             <div class="text-sm font-bold">Out for Delivery</div>
                             <div class="text-xs text-gray-400">Today, 9:00 AM</div>
                        </div>
                         <div class="relative">
                             <div class="absolute -left-[21px] top-1 w-4 h-4 bg-slate-700 rounded-full border-2 border-black"></div>
                             <div class="text-sm text-gray-400">In Transit</div>
                             <div class="text-xs text-gray-500">Yesterday, 6:00 PM</div>
                        </div>
                         <div class="relative">
                             <div class="absolute -left-[21px] top-1 w-4 h-4 bg-slate-700 rounded-full border-2 border-black"></div>
                             <div class="text-sm text-gray-400">Picked Up</div>
                             <div class="text-xs text-gray-500">Yesterday, 2:00 PM</div>
                        </div>
                    </div>

                    <!-- Cross Sell -->
                    <div class="mt-8 pt-6 border-t border-slate-800">
                        <h4 class="font-bold mb-4">You might also like</h4>
                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-slate-900 p-2 rounded-lg">
                                <div class="h-20 bg-slate-800 rounded mb-2"></div>
                                <div class="h-2 w-2/3 bg-slate-700 rounded"></div>
                            </div>
                            <div class="bg-slate-900 p-2 rounded-lg">
                                <div class="h-20 bg-slate-800 rounded mb-2"></div>
                                <div class="h-2 w-2/3 bg-slate-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
           </div>

           <!-- Features List -->
           <div>
               <div class="space-y-8">
                   <div class="flex">
                       <div class="flex-shrink-0 mr-4">
                           <div class="w-12 h-12 bg-pink-900/30 rounded-xl flex items-center justify-center text-pink-500">
                               <Icon name="heroicons:paint-brush" class="w-6 h-6" />
                           </div>
                       </div>
                       <div>
                           <h3 class="text-xl font-bold text-white mb-2">Fully Customizable</h3>
                           <p class="text-gray-400">Add your logo, brand colors, social links, and marketing banners. No coding required.</p>
                       </div>
                   </div>

                   <div class="flex">
                       <div class="flex-shrink-0 mr-4">
                           <div class="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-500">
                               <Icon name="heroicons:shopping-bag" class="w-6 h-6" />
                           </div>
                       </div>
                       <div>
                           <h3 class="text-xl font-bold text-white mb-2">Upsell & Cross-sell</h3>
                           <p class="text-gray-400">Show personalized product recommendations on the tracking page to drive repeat purchases.</p>
                       </div>
                   </div>

                   <div class="flex">
                       <div class="flex-shrink-0 mr-4">
                           <div class="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-500">
                               <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-6 h-6" />
                           </div>
                       </div>
                       <div>
                           <h3 class="text-xl font-bold text-white mb-2">Proactive Updates</h3>
                           <p class="text-gray-400">Reduce "Where is my order?" calls by 80% with automated SMS and WhatsApp notifications.</p>
                       </div>
                   </div>
               </div>
           </div>
        </div>
      </div>
    </section>

    <!-- Key Features Section -->
    <section class="py-24 bg-black relative">
  <div class="container mx-auto px-6">
    <div class="text-center mb-20">
      <h2 class="text-4xl font-bold text-white mb-6">Tracking Intelligence</h2>
      <p class="text-xl text-gray-400 max-w-2xl mx-auto">
        Real-time data for you, polished experience for them.
      </p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Feature Card 1 -->
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

      <!-- Feature Card 2 -->
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

      <!-- Feature Card 3 -->
      <div class="text-orange-400 font-semibold">Smart Predictions</div>
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
