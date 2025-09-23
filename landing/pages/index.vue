<template>
  <div>
    <!-- Navigation -->
    <AppNavigation />
    
        <!-- Hero Section -->
        <section class="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <!-- Animated Background Container -->
          <div class="absolute inset-0 z-0">
            <!-- CSS Particle System -->
            <div class="particle-system">
              <div v-for="i in 50" :key="i" class="data-particle" :style="`top: ${Math.random() * 100}%; left: ${Math.random() * 100}%; animation-delay: ${Math.random() * 6}s;`"></div>
            </div>
            
            <!-- Floating 3D Cubes -->
            <div class="floating-cube" style="top: 15%; left: 10%; animation-delay: 0s;"></div>
            <div class="floating-cube" style="top: 25%; right: 15%; animation-delay: -2s;"></div>
            <div class="floating-cube" style="top: 60%; left: 20%; animation-delay: -4s;"></div>
            <div class="floating-cube" style="top: 40%; right: 25%; animation-delay: -6s;"></div>
            <div class="floating-cube" style="top: 75%; right: 10%; animation-delay: -8s;"></div>
            <div class="floating-cube" style="top: 35%; left: 80%; animation-delay: -10s;"></div>
          </div>
      
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 z-1">
        <!-- Geometric Shapes -->
        <div class="absolute top-20 left-20 w-32 h-32 border border-cyan-400/30 rotate-45 animate-spin-slow"></div>
        <div class="absolute top-40 right-32 w-24 h-24 border border-purple-400/30 rotate-12 animate-bounce-slow"></div>
        <div class="absolute bottom-32 left-40 w-20 h-20 border border-pink-400/30 rotate-45 animate-pulse"></div>
        
        <!-- Floating Orbs -->
        <div class="absolute top-1/4 left-1/4 w-4 h-4 bg-cyan-400/60 rounded-full animate-float blur-sm"></div>
        <div class="absolute top-1/2 right-1/4 w-6 h-6 bg-purple-400/60 rounded-full animate-float blur-sm" style="animation-delay: -2s;"></div>
        <div class="absolute bottom-1/4 left-1/3 w-3 h-3 bg-pink-400/60 rounded-full animate-float blur-sm" style="animation-delay: -4s;"></div>
        
        <!-- Grid Pattern -->
        <div class="absolute inset-0 opacity-10" style="background-image: linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px); background-size: 50px 50px;"></div>
      </div>
      
      <!-- Glassmorphism Overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-purple-900/20 backdrop-blur-sm z-2"></div>
      
      <div class="container mx-auto px-6 relative z-10">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Content Side -->
          <div class="text-white">
            <!-- Floating Badge -->
            <div class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-md rounded-full border border-cyan-400/30 text-cyan-300 text-sm font-semibold mb-8 animate-glow">
              <div class="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
              Next-Gen E-commerce Platform
              <Icon name="heroicons:sparkles" class="w-4 h-4 ml-3" />
            </div>
            
            <h1 class="text-6xl md:text-8xl font-black mb-6 leading-tight">
              <span class="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                DigiHub
              </span>
              <span class="block text-4xl md:text-5xl font-light mt-4 text-gray-300">
                ChannelConnector & Logistics
              </span>
            </h1>
            
            <p class="text-xl md:text-2xl mb-10 text-gray-300 leading-relaxed max-w-2xl">
              Revolutionary <span class="text-cyan-400 font-semibold">AI-powered</span> platform that unifies your entire e-commerce ecosystem. 
              Experience <span class="text-purple-400 font-semibold">real-time synchronization</span> across infinite channels.
            </p>
            
            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-6 mb-12">
              <button class="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl text-white font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25">
                <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="relative flex items-center justify-center">
                  <Icon name="heroicons:rocket-launch" class="w-6 h-6 mr-3" />
                  Launch Free Trial
                  <div class="ml-3 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </button>
              
              <button class="group px-8 py-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:bg-white/10 hover:border-cyan-400/50">
                <div class="flex items-center justify-center">
                  <Icon name="heroicons:play-circle" class="w-6 h-6 mr-3 group-hover:text-cyan-400 transition-colors" />
                  Watch Demo
                </div>
              </button>
            </div>
            
            <!-- Trust Indicators -->
            <div class="flex flex-wrap gap-8 text-sm">
              <div class="flex items-center text-gray-400">
                <div class="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span class="text-green-400 font-semibold">99.9%</span> Uptime SLA
              </div>
              <div class="flex items-center text-gray-400">
                <div class="w-3 h-3 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
                <span class="text-cyan-400 font-semibold">Enterprise</span> Security
              </div>
              <div class="flex items-center text-gray-400">
                <div class="w-3 h-3 bg-purple-400 rounded-full mr-3 animate-pulse"></div>
                <span class="text-purple-400 font-semibold">24/7</span> AI Support
              </div>
            </div>
          </div>
          
          <!-- Visual Side -->
          <div class="relative">
            <!-- Main 3D Visualization Container -->
            <div class="relative w-full h-96 lg:h-[600px]">
              <!-- Central Hub Visualization -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="relative">
                  <!-- Central Core -->
                  <div class="w-32 h-32 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-3xl animate-spin-slow shadow-2xl shadow-cyan-500/50 flex items-center justify-center">
                    <Icon name="heroicons:cpu-chip" class="w-16 h-16 text-white" />
                  </div>
                  
                  <!-- Orbiting Elements -->
                  <div class="absolute inset-0 animate-spin" style="animation-duration: 20s;">
                    <!-- Logistics & Shipping Elements -->
                    <div class="absolute -top-20 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Icon name="heroicons:truck" class="w-8 h-8 text-white" />
                    </div>
                    <div class="absolute top-1/2 -right-20 transform -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Icon name="heroicons:cube" class="w-8 h-8 text-white" />
                    </div>
                    <div class="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Icon name="heroicons:map-pin" class="w-8 h-8 text-white" />
                    </div>
                    <div class="absolute top-1/2 -left-20 transform -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Icon name="heroicons:clock" class="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <!-- Connection Lines -->
                  <div class="absolute inset-0">
                    <div class="absolute top-1/2 left-1/2 w-40 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 rotate-0"></div>
                    <div class="absolute top-1/2 left-1/2 w-40 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 rotate-90"></div>
                    <div class="absolute top-1/2 left-1/2 w-40 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                    <div class="absolute top-1/2 left-1/2 w-40 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
                  </div>
                </div>
              </div>
              
              <!-- Floating Data Particles -->
              <div class="absolute top-16 right-16 w-8 h-8 bg-cyan-400/60 rounded-full animate-bounce"></div>
              <div class="absolute bottom-20 left-12 w-6 h-6 bg-purple-400/60 rounded-full animate-bounce" style="animation-delay: -1s;"></div>
              <div class="absolute top-32 left-20 w-4 h-4 bg-pink-400/60 rounded-full animate-bounce" style="animation-delay: -2s;"></div>
              
              <!-- Holographic Frame -->
              <div class="absolute inset-0 border border-cyan-400/30 rounded-3xl animate-pulse"></div>
              <div class="absolute -inset-4 border border-purple-400/20 rounded-3xl animate-pulse" style="animation-delay: -1s;"></div>
            </div>
            
                <!-- Stats Overlay -->
                <div class="absolute -bottom-8 -left-8 bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-cyan-400/30">
                  <div class="text-center">
                    <div class="text-3xl font-bold text-cyan-400 mb-1">4+</div>
                    <div class="text-gray-300 text-sm">Carriers</div>
                  </div>
                </div>
                
                <div class="absolute -top-8 -right-8 bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-purple-400/30">
                  <div class="text-center">
                    <div class="text-3xl font-bold text-purple-400 mb-1">24/7</div>
                    <div class="text-gray-300 text-sm">Tracking</div>
                  </div>
                </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-blue-600 mb-2">8+</div>
            <div class="text-gray-600 font-medium">E-commerce Platforms</div>
          </div>
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-purple-600 mb-2">4+</div>
            <div class="text-gray-600 font-medium">Shipping Carriers</div>
          </div>
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-green-600 mb-2">99.9%</div>
            <div class="text-gray-600 font-medium">Data Accuracy</div>
          </div>
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-red-600 mb-2">70%</div>
            <div class="text-gray-600 font-medium">Time Savings</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Business Problems Solved Section -->
    <section class="py-32 relative overflow-hidden">
      <!-- Background with subtle pattern -->
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900"></div>
      <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"></div>
      
      <!-- Floating elements -->
      <div class="absolute top-32 left-16 w-72 h-72 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-32 right-16 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
      
      <div class="container mx-auto px-6 relative z-10">
        <!-- Section Header -->
        <div class="text-center mb-20">
          <div class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-full text-red-400 text-sm font-semibold mb-8 border border-red-400/30">
            <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 mr-3" />
            Critical Business Challenges
            <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 ml-3" />
          </div>
          
          <h2 class="text-6xl md:text-8xl font-black text-white mb-8 leading-tight">
            <span class="text-red-400">Problems</span>
            <br>
            <span class="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              We Solve
            </span>
          </h2>
          
          <p class="text-2xl md:text-3xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Transform operational chaos into 
            <span class="text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text font-bold">
              streamlined efficiency
            </span>
          </p>
        </div>
        
        <!-- Problems Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <!-- Channel Fragmentation -->
          <div class="group relative">
            <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
              <!-- Problem Icon Background -->
              <div class="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-red-400/20 to-orange-500/20 rounded-full blur-xl animate-pulse"></div>
              
              <!-- Problem Icon -->
              <div class="relative w-16 h-16 bg-gradient-to-r from-red-400 to-orange-500 rounded-2xl mb-6 flex items-center justify-center shadow-2xl">
                <Icon name="heroicons:puzzle-piece" class="w-9 h-9 text-white animate-pulse" />
              </div>
              
              <!-- Impact Metric -->
              <div class="mb-4">
                <div class="text-4xl font-black text-red-400 mb-2">
                  80%
                </div>
                <div class="text-white/60 text-sm font-medium tracking-wider uppercase">Time Wasted</div>
              </div>
              
              <!-- Problem Title & Description -->
              <h3 class="text-2xl font-bold text-white mb-3">Channel Fragmentation</h3>
              <p class="text-white/70 leading-relaxed mb-4">
                Manual management across multiple e-commerce platforms leading to operational inefficiency and errors
              </p>
              
              <!-- Solution Preview -->
              <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <div class="flex items-center text-green-400 text-sm font-medium">
                  <Icon name="heroicons:check-circle" class="w-4 h-4 mr-2" />
                  Unified dashboard solution
                </div>
              </div>
            </div>
          </div>
          
          <!-- Inventory Discrepancies -->
          <div class="group relative">
            <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
              <!-- Problem Icon Background -->
              <div class="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-yellow-400/20 to-red-500/20 rounded-full blur-xl animate-pulse" style="animation-delay: 1s;"></div>
              
              <!-- Problem Icon -->
              <div class="relative w-16 h-16 bg-gradient-to-r from-yellow-400 to-red-500 rounded-2xl mb-6 flex items-center justify-center shadow-2xl">
                <Icon name="heroicons:exclamation-triangle" class="w-9 h-9 text-white animate-bounce" />
              </div>
              
              <!-- Impact Metric -->
              <div class="mb-4">
                <div class="text-4xl font-black text-yellow-400 mb-2">
                  95%
                </div>
                <div class="text-white/60 text-sm font-medium tracking-wider uppercase">Overselling Risk</div>
              </div>
              
              <!-- Problem Title & Description -->
              <h3 class="text-2xl font-bold text-white mb-3">Inventory Discrepancies</h3>
              <p class="text-white/70 leading-relaxed mb-4">
                Overselling and stock inconsistencies across channels causing customer dissatisfaction and lost revenue
              </p>
              
              <!-- Solution Preview -->
              <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <div class="flex items-center text-green-400 text-sm font-medium">
                  <Icon name="heroicons:check-circle" class="w-4 h-4 mr-2" />
                  Real-time synchronization
                </div>
              </div>
            </div>
          </div>
          
          <!-- Order Processing Delays -->
          <div class="group relative">
            <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
              <!-- Problem Icon Background -->
              <div class="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-xl animate-pulse" style="animation-delay: 2s;"></div>
              
              <!-- Problem Icon -->
              <div class="relative w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl mb-6 flex items-center justify-center shadow-2xl">
                <Icon name="heroicons:clock" class="w-9 h-9 text-white animate-spin-slow" />
              </div>
              
              <!-- Impact Metric -->
              <div class="mb-4">
                <div class="text-4xl font-black text-orange-400 mb-2">
                  60%
                </div>
                <div class="text-white/60 text-sm font-medium tracking-wider uppercase">Slower Processing</div>
              </div>
              
              <!-- Problem Title & Description -->
              <h3 class="text-2xl font-bold text-white mb-3">Processing Delays</h3>
              <p class="text-white/70 leading-relaxed mb-4">
                Manual order processing causing fulfillment delays and poor customer experience
              </p>
              
              <!-- Solution Preview -->
              <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <div class="flex items-center text-green-400 text-sm font-medium">
                  <Icon name="heroicons:check-circle" class="w-4 h-4 mr-2" />
                  Automated workflows
                </div>
              </div>
            </div>
          </div>
          
          <!-- Shipping Complexity -->
          <div class="group relative">
            <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
              <!-- Problem Icon Background -->
              <div class="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse" style="animation-delay: 3s;"></div>
              
              <!-- Problem Icon -->
              <div class="relative w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl mb-6 flex items-center justify-center shadow-2xl">
                <Icon name="heroicons:truck" class="w-9 h-9 text-white" />
              </div>
              
              <!-- Impact Metric -->
              <div class="mb-4">
                <div class="text-4xl font-black text-purple-400 mb-2">
                  40%
                </div>
                <div class="text-white/60 text-sm font-medium tracking-wider uppercase">Higher Costs</div>
              </div>
              
              <!-- Problem Title & Description -->
              <h3 class="text-2xl font-bold text-white mb-3">Shipping Complexity</h3>
              <p class="text-white/70 leading-relaxed mb-4">
                Managing multiple carriers with different APIs and processes increases operational overhead
              </p>
              
              <!-- Solution Preview -->
              <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <div class="flex items-center text-green-400 text-sm font-medium">
                  <Icon name="heroicons:check-circle" class="w-4 h-4 mr-2" />
                  Unified carrier integration
                </div>
              </div>
            </div>
          </div>
          
          <!-- Data Inconsistency -->
          <div class="group relative">
            <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
              <!-- Problem Icon Background -->
              <div class="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse" style="animation-delay: 4s;"></div>
              
              <!-- Problem Icon -->
              <div class="relative w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl mb-6 flex items-center justify-center shadow-2xl">
                <Icon name="heroicons:x-circle" class="w-9 h-9 text-white animate-pulse" />
              </div>
              
              <!-- Impact Metric -->
              <div class="mb-4">
                <div class="text-4xl font-black text-cyan-400 mb-2">
                  70%
                </div>
                <div class="text-white/60 text-sm font-medium tracking-wider uppercase">Error Rate</div>
              </div>
              
              <!-- Problem Title & Description -->
              <h3 class="text-2xl font-bold text-white mb-3">Data Inconsistency</h3>
              <p class="text-white/70 leading-relaxed mb-4">
                Product and order data mismatches across systems leading to operational errors and confusion
              </p>
              
              <!-- Solution Preview -->
              <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <div class="flex items-center text-green-400 text-sm font-medium">
                  <Icon name="heroicons:check-circle" class="w-4 h-4 mr-2" />
                  99.9% data accuracy
                </div>
              </div>
            </div>
          </div>
          
          <!-- Limited Visibility -->
          <div class="group relative">
            <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
              <!-- Problem Icon Background -->
              <div class="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-indigo-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse" style="animation-delay: 5s;"></div>
              
              <!-- Problem Icon -->
              <div class="relative w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl mb-6 flex items-center justify-center shadow-2xl">
                <Icon name="heroicons:eye-slash" class="w-9 h-9 text-white animate-pulse" />
              </div>
              
              <!-- Impact Metric -->
              <div class="mb-4">
                <div class="text-4xl font-black text-indigo-400 mb-2">
                  90%
                </div>
                <div class="text-white/60 text-sm font-medium tracking-wider uppercase">Blind Spots</div>
              </div>
              
              <!-- Problem Title & Description -->
              <h3 class="text-2xl font-bold text-white mb-3">Limited Visibility</h3>
              <p class="text-white/70 leading-relaxed mb-4">
                Lack of real-time visibility into order and shipment status affecting customer satisfaction
              </p>
              
              <!-- Solution Preview -->
              <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <div class="flex items-center text-green-400 text-sm font-medium">
                  <Icon name="heroicons:check-circle" class="w-4 h-4 mr-2" />
                  Complete transparency
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Transformation Arrow -->
        <div class="text-center mb-16">
          <div class="inline-flex items-center space-x-4">
            <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <Icon name="heroicons:face-frown" class="w-8 h-8 text-white" />
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-8 h-1 bg-gradient-to-r from-red-500 to-green-500 rounded-full"></div>
              <div class="w-8 h-1 bg-gradient-to-r from-red-500 to-green-500 rounded-full"></div>
              <div class="w-8 h-1 bg-gradient-to-r from-red-500 to-green-500 rounded-full"></div>
              <Icon name="heroicons:arrow-right" class="w-8 h-8 text-green-400 animate-bounce" />
            </div>
            <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Icon name="heroicons:face-smile" class="w-8 h-8 text-white" />
            </div>
          </div>
          <p class="text-white/80 mt-4 text-lg">From Operational Chaos to Streamlined Success</p>
        </div>
        
        <!-- Bottom CTA -->
        <div class="text-center">
          <NuxtLink to="/solutions" class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white font-bold text-lg hover:scale-105 transition-transform duration-300 cursor-pointer shadow-2xl">
            <Icon name="heroicons:wrench-screwdriver" class="w-6 h-6 mr-3" />
            See How We Solve These Problems
            <Icon name="heroicons:arrow-right" class="w-6 h-6 ml-3" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="section-title">
            Powerful Features for 
            <span class="gradient-text">Modern E-commerce</span>
          </h2>
          <p class="section-subtitle">
            Everything you need to manage multiple sales channels, automate operations, 
            and scale your business efficiently.
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Multi-Channel Integration -->
          <div class="feature-card">
            <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Icon name="heroicons:globe-alt" class="w-8 h-8 text-blue-600" />
            </div>
            <h3 class="text-xl font-bold mb-4">Multi-Channel Integration</h3>
            <p class="text-gray-600 mb-4">
              Connect and manage multiple e-commerce platforms from a single dashboard. 
              Supports Shopify, WooCommerce, Amazon, eBay, and more.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• Shopify & WooCommerce</li>
              <li>• Amazon SP-API</li>
              <li>• eBay & Mirakl</li>
              <li>• PrestaShop & Magento</li>
            </ul>
          </div>

          <!-- Real-time Synchronization -->
          <div class="feature-card">
            <div class="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <Icon name="heroicons:arrow-path" class="w-8 h-8 text-green-600" />
            </div>
            <h3 class="text-xl font-bold mb-4">Real-time Synchronization</h3>
            <p class="text-gray-600 mb-4">
              Bidirectional data sync ensures inventory, orders, and product information 
              stay consistent across all channels.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• Instant inventory updates</li>
              <li>• Order synchronization</li>
              <li>• Product data sync</li>
              <li>• Price management</li>
            </ul>
          </div>

          <!-- Automated Order Processing -->
          <div class="feature-card">
            <div class="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Icon name="heroicons:cog-6-tooth" class="w-8 h-8 text-purple-600" />
            </div>
            <h3 class="text-xl font-bold mb-4">Automated Order Processing</h3>
            <p class="text-gray-600 mb-4">
              4-step automated workflow from order creation to shipment tracking. 
              Reduce manual work by 70%.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• Order validation</li>
              <li>• Automatic fulfillment</li>
              <li>• Shipment creation</li>
              <li>• Tracking updates</li>
            </ul>
          </div>

          <!-- Multi-Carrier Shipping -->
          <div class="feature-card">
            <div class="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
              <Icon name="heroicons:truck" class="w-8 h-8 text-orange-600" />
            </div>
            <h3 class="text-xl font-bold mb-4">Multi-Carrier Shipping</h3>
            <p class="text-gray-600 mb-4">
              Integrated with top shipping providers. Automatic rate comparison 
              and carrier selection for optimal costs.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• Digihub & Bluedart</li>
              <li>• DTDC & Delhivery</li>
              <li>• Rate comparison</li>
              <li>• Automated selection</li>
            </ul>
          </div>

          <!-- Real-time Tracking -->
          <div class="feature-card">
            <div class="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
              <Icon name="heroicons:map-pin" class="w-8 h-8 text-indigo-600" />
            </div>
            <h3 class="text-xl font-bold mb-4">Real-time Tracking</h3>
            <p class="text-gray-600 mb-4">
              Complete visibility with 5-stage tracking timeline. Handle exceptions 
              like COD, RTO, and NDR automatically.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• 5-stage tracking</li>
              <li>• Exception handling</li>
              <li>• Customer notifications</li>
              <li>• Delivery confirmation</li>
            </ul>
          </div>

          <!-- Enterprise Security -->
          <div class="feature-card">
            <div class="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-6">
              <Icon name="heroicons:shield-check" class="w-8 h-8 text-red-600" />
            </div>
            <h3 class="text-xl font-bold mb-4">Enterprise Security</h3>
            <p class="text-gray-600 mb-4">
              JWT-based authentication, role-based access control, and 
              comprehensive audit trails for complete security.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• JWT authentication</li>
              <li>• Role-based access</li>
              <li>• Data encryption</li>
              <li>• Audit trails</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Value Proposition Section -->
    <section class="py-32 relative overflow-hidden bg-black">
      <!-- Animated Background -->
      <div class="absolute inset-0">
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-pink-900/50"></div>
        
        <!-- Animated Grid -->
        <div class="absolute inset-0 opacity-20">
          <div class="absolute inset-0" style="background-image: linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px); background-size: 50px 50px; animation: grid-move 20s linear infinite;"></div>
        </div>
        
        <!-- Floating Orbs -->
        <div class="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute top-40 right-32 w-48 h-48 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 3s;"></div>
        <div class="absolute bottom-32 left-1/3 w-56 h-56 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 6s;"></div>
        
        <!-- Particle Effect -->
        <div class="absolute inset-0">
          <div class="particle particle-1"></div>
          <div class="particle particle-2"></div>
          <div class="particle particle-3"></div>
          <div class="particle particle-4"></div>
          <div class="particle particle-5"></div>
        </div>
      </div>
      
      <div class="container mx-auto px-6 relative z-10">
        <!-- Section Header -->
        <div class="text-center mb-20">
          <div class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full text-cyan-400 text-sm font-semibold mb-8 border border-cyan-400/30">
            <Icon name="heroicons:chart-bar-square" class="w-5 h-5 mr-3" />
            Core Value Proposition
            <Icon name="heroicons:chart-bar-square" class="w-5 h-5 ml-3" />
          </div>
          
          <h2 class="text-6xl md:text-8xl font-black text-white mb-8 leading-tight">
            <span class="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Measurable
            </span>
            <br>
            <span class="text-white">Results</span>
          </h2>
          
          <p class="text-2xl md:text-3xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Transform your business with proven metrics and 
            <span class="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-bold">
              extraordinary performance gains
            </span>
          </p>
        </div>
        
        <!-- Value Cards Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <!-- Operational Efficiency -->
          <div class="group relative">
            <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
              <!-- Animated Icon Background -->
              <div class="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-xl animate-pulse"></div>
              
              <!-- Icon -->
              <div class="relative w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl mb-6 flex items-center justify-center shadow-2xl">
                <Icon name="heroicons:cog-6-tooth" class="w-9 h-9 text-white animate-spin-slow" />
              </div>
              
              <!-- Metric -->
              <div class="mb-4">
                <div class="text-5xl font-black text-transparent bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text mb-2">
                  70%
                </div>
                <div class="text-white/60 text-sm font-medium tracking-wider uppercase">Reduction</div>
              </div>
              
              <!-- Title & Description -->
              <h3 class="text-2xl font-bold text-white mb-3">Operational Efficiency</h3>
              <p class="text-white/70 leading-relaxed">
                Dramatic reduction in manual processing time through intelligent automation and streamlined workflows
              </p>
              
              <!-- Progress Bar -->
              <div class="mt-6 bg-white/10 rounded-full h-2 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse" style="width: 70%;"></div>
              </div>
            </div>
          </div>
          
          <!-- Data Consistency -->
          <div class="group relative">
            <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
              <!-- Animated Icon Background -->
              <div class="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-emerald-400/20 to-green-500/20 rounded-full blur-xl animate-pulse" style="animation-delay: 1s;"></div>
              
              <!-- Icon -->
              <div class="relative w-16 h-16 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl mb-6 flex items-center justify-center shadow-2xl">
                <Icon name="heroicons:arrow-path" class="w-9 h-9 text-white animate-spin" />
              </div>
              
              <!-- Metric -->
              <div class="mb-4">
                <div class="text-5xl font-black text-transparent bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text mb-2">
                  100%
                </div>
                <div class="text-white/60 text-sm font-medium tracking-wider uppercase">Synchronized</div>
              </div>
              
              <!-- Title & Description -->
              <h3 class="text-2xl font-bold text-white mb-3">Data Consistency</h3>
              <p class="text-white/70 leading-relaxed">
                Perfect synchronization across all channels and systems with real-time data integrity validation
              </p>
              
              <!-- Progress Bar -->
              <div class="mt-6 bg-white/10 rounded-full h-2 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse" style="width: 100%; animation-delay: 1s;"></div>
              </div>
            </div>
          </div>
          
          <!-- Cost Optimization -->
          <div class="group relative">
            <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
              <!-- Animated Icon Background -->
              <div class="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse" style="animation-delay: 2s;"></div>
              
              <!-- Icon -->
              <div class="relative w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl mb-6 flex items-center justify-center shadow-2xl">
                <Icon name="heroicons:currency-dollar" class="w-9 h-9 text-white animate-bounce" />
              </div>
              
              <!-- Metric -->
              <div class="mb-4">
                <div class="text-5xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-2">
                  40%
                </div>
                <div class="text-white/60 text-sm font-medium tracking-wider uppercase">Cost Savings</div>
              </div>
              
              <!-- Title & Description -->
              <h3 class="text-2xl font-bold text-white mb-3">Cost Optimization</h3>
              <p class="text-white/70 leading-relaxed">
                Intelligent carrier selection and automated rate optimization for maximum shipping cost efficiency
              </p>
              
              <!-- Progress Bar -->
              <div class="mt-6 bg-white/10 rounded-full h-2 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse" style="width: 40%; animation-delay: 2s;"></div>
              </div>
            </div>
          </div>
          
          <!-- Scalability -->
          <div class="group relative">
            <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
              <!-- Animated Icon Background -->
              <div class="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse" style="animation-delay: 3s;"></div>
              
              <!-- Icon -->
              <div class="relative w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl mb-6 flex items-center justify-center shadow-2xl">
                <Icon name="heroicons:arrow-trending-up" class="w-9 h-9 text-white" />
              </div>
              
              <!-- Metric -->
              <div class="mb-4">
                <div class="text-4xl font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text mb-2 flex items-center">
                  ∞
                  <span class="text-2xl ml-2">Orders</span>
                </div>
                <div class="text-white/60 text-sm font-medium tracking-wider uppercase">Unlimited Scale</div>
              </div>
              
              <!-- Title & Description -->
              <h3 class="text-2xl font-bold text-white mb-3">Infinite Scalability</h3>
              <p class="text-white/70 leading-relaxed">
                Cloud-native architecture supporting unlimited orders and channels with automatic scaling
              </p>
              
              <!-- Progress Bar -->
              <div class="mt-6 bg-white/10 rounded-full h-2 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse" style="width: 100%; animation-delay: 3s;"></div>
              </div>
            </div>
          </div>
          
          <!-- Customer Experience -->
          <div class="group relative md:col-span-2 lg:col-span-2">
            <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
              <!-- Animated Icon Background -->
              <div class="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-xl animate-pulse" style="animation-delay: 4s;"></div>
              
              <!-- Icon -->
              <div class="relative w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl mb-6 flex items-center justify-center shadow-2xl">
                <Icon name="heroicons:heart" class="w-9 h-9 text-white animate-pulse" />
              </div>
              
              <!-- Metric -->
              <div class="mb-4">
                <div class="text-5xl font-black text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text mb-2">
                  Real-time
                </div>
                <div class="text-white/60 text-sm font-medium tracking-wider uppercase">Customer Experience</div>
              </div>
              
              <!-- Title & Description -->
              <h3 class="text-2xl font-bold text-white mb-3">Superior Customer Experience</h3>
              <p class="text-white/70 leading-relaxed">
                Real-time tracking, proactive notifications, and transparent communication that delights customers at every touchpoint
              </p>
              
              <!-- Progress Bar -->
              <div class="mt-6 bg-white/10 rounded-full h-2 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" style="width: 95%; animation-delay: 4s;"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Bottom CTA -->
        <div class="text-center">
          <div class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl text-white font-bold text-lg hover:scale-105 transition-transform duration-300 cursor-pointer shadow-2xl">
            <Icon name="heroicons:rocket-launch" class="w-6 h-6 mr-3 animate-bounce" />
            Experience These Results Today
            <Icon name="heroicons:arrow-right" class="w-6 h-6 ml-3" />
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="section-title">How DigiHub Works</h2>
          <p class="section-subtitle">
            Simple 4-step process to transform your e-commerce operations
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
              1
            </div>
            <h3 class="text-xl font-bold mb-4">Connect Channels</h3>
            <p class="text-gray-600">
              Link your e-commerce platforms and configure synchronization settings
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
              2
            </div>
            <h3 class="text-xl font-bold mb-4">Sync Data</h3>
            <p class="text-gray-600">
              Real-time bidirectional synchronization of products, inventory, and orders
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
              3
            </div>
            <h3 class="text-xl font-bold mb-4">Automate Orders</h3>
            <p class="text-gray-600">
              Automated processing from order creation to shipment with carrier integration
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
              4
            </div>
            <h3 class="text-xl font-bold mb-4">Track & Deliver</h3>
            <p class="text-gray-600">
              Real-time tracking with customer notifications and exception handling
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Integrations Section -->
    <section class="py-32 relative overflow-hidden">
      <!-- Animated Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>
      <div class="absolute inset-0 bg-black/20"></div>
      
      <!-- Floating Geometric Shapes -->
      <div class="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
      <div class="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-xl animate-pulse" style="animation-delay: 2s;"></div>
      <div class="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse" style="animation-delay: 4s;"></div>
      <div class="absolute bottom-32 right-1/3 w-28 h-28 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse" style="animation-delay: 6s;"></div>
      
      <!-- Grid Pattern Overlay -->
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 25px 25px, white 2px, transparent 0); background-size: 50px 50px;"></div>
      
      <div class="container mx-auto px-6 relative z-10">
        <div class="text-center mb-20">
          <div class="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium mb-6">
            <Icon name="heroicons:star" class="w-4 h-4 mr-2" />
            Trusted by Industry Leaders
          </div>
          <h2 class="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
            <span class="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Seamless
            </span>
            <br>
            <span class="text-white">Integrations</span>
          </h2>
          <p class="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Connect with the world's leading e-commerce platforms and shipping providers 
            through our powerful, unified integration hub
          </p>
        </div>
        
        <!-- E-commerce Platforms -->
        <div class="mb-24">
          <div class="flex items-center justify-center mb-12">
            <div class="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1 max-w-xs"></div>
            <div class="px-6">
              <h3 class="text-2xl font-bold text-white tracking-wider">E-COMMERCE PLATFORMS</h3>
            </div>
            <div class="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1 max-w-xs"></div>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
            <!-- Shopify -->
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 h-28 flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-500 transform hover:scale-105">
                <div class="w-14 h-14 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl mb-2 flex items-center justify-center shadow-lg">
                  <Icon name="heroicons:shopping-bag" class="w-8 h-8 text-white" />
                </div>
                <span class="text-xs font-bold text-white">Shopify</span>
              </div>
            </div>
            
            <!-- WooCommerce -->
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 h-28 flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-500 transform hover:scale-105">
                <div class="w-14 h-14 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl mb-2 flex items-center justify-center shadow-lg">
                  <Icon name="heroicons:globe-alt" class="w-8 h-8 text-white" />
                </div>
                <span class="text-xs font-bold text-white">WooCommerce</span>
              </div>
            </div>
            
            <!-- Amazon -->
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 h-28 flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-500 transform hover:scale-105">
                <div class="w-14 h-14 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl mb-2 flex items-center justify-center shadow-lg">
                  <Icon name="heroicons:shopping-cart" class="w-8 h-8 text-white" />
                </div>
                <span class="text-xs font-bold text-white">Amazon</span>
              </div>
            </div>
            
            <!-- eBay -->
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 h-28 flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-500 transform hover:scale-105">
                <div class="w-14 h-14 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl mb-2 flex items-center justify-center shadow-lg">
                  <Icon name="heroicons:cursor-arrow-rays" class="w-8 h-8 text-white" />
                </div>
                <span class="text-xs font-bold text-white">eBay</span>
              </div>
            </div>
            
            <!-- Mirakl -->
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 h-28 flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-500 transform hover:scale-105">
                <div class="w-14 h-14 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl mb-2 flex items-center justify-center shadow-lg">
                  <Icon name="heroicons:building-storefront" class="w-8 h-8 text-white" />
                </div>
                <span class="text-xs font-bold text-white">Mirakl</span>
              </div>
            </div>
            
            <!-- PrestaShop -->
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-pink-400 to-pink-600 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 h-28 flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-500 transform hover:scale-105">
                <div class="w-14 h-14 bg-gradient-to-r from-pink-400 to-pink-600 rounded-2xl mb-2 flex items-center justify-center shadow-lg">
                  <Icon name="heroicons:squares-2x2" class="w-8 h-8 text-white" />
                </div>
                <span class="text-xs font-bold text-white">PrestaShop</span>
              </div>
            </div>
            
            <!-- Magento -->
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-red-400 to-red-600 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 h-28 flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-500 transform hover:scale-105">
                <div class="w-14 h-14 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl mb-2 flex items-center justify-center shadow-lg">
                  <Icon name="heroicons:cube" class="w-8 h-8 text-white" />
                </div>
                <span class="text-xs font-bold text-white">Magento</span>
              </div>
            </div>
            
            <!-- More -->
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 h-28 flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-500 transform hover:scale-105">
                <div class="w-14 h-14 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-2xl mb-2 flex items-center justify-center shadow-lg">
                  <Icon name="heroicons:plus" class="w-8 h-8 text-white" />
                </div>
                <span class="text-xs font-bold text-white">More</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Shipping Providers -->
        <div class="relative">
          <div class="flex items-center justify-center mb-12">
            <div class="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1 max-w-xs"></div>
            <div class="px-6">
              <h3 class="text-2xl font-bold text-white tracking-wider">SHIPPING PROVIDERS</h3>
            </div>
            <div class="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1 max-w-xs"></div>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <!-- DigiHub -->
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 h-36 flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-500 transform hover:scale-105">
                <div class="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl mb-3 flex items-center justify-center shadow-xl">
                  <Icon name="heroicons:truck" class="w-9 h-9 text-white" />
                </div>
                <span class="text-sm font-bold text-white">DigiHub</span>
              </div>
            </div>
            
            <!-- BlueDart -->
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-red-400 to-red-600 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 h-36 flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-500 transform hover:scale-105">
                <div class="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl mb-3 flex items-center justify-center shadow-xl">
                  <Icon name="heroicons:paper-airplane" class="w-9 h-9 text-white" />
                </div>
                <span class="text-sm font-bold text-white">BlueDart</span>
              </div>
            </div>
            
            <!-- DTDC -->
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 h-36 flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-500 transform hover:scale-105">
                <div class="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl mb-3 flex items-center justify-center shadow-xl">
                  <Icon name="heroicons:rocket-launch" class="w-9 h-9 text-white" />
                </div>
                <span class="text-sm font-bold text-white">DTDC</span>
              </div>
            </div>
            
            <!-- Delhivery -->
            <div class="group relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 h-36 flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-500 transform hover:scale-105">
                <div class="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl mb-3 flex items-center justify-center shadow-xl">
                  <Icon name="heroicons:bolt" class="w-9 h-9 text-white" />
                </div>
                <span class="text-sm font-bold text-white">Delhivery</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Connection Lines Animation -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          <svg class="w-full h-full opacity-20" viewBox="0 0 800 600">
            <defs>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:0" />
                <stop offset="50%" style="stop-color:#60a5fa;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:0" />
              </linearGradient>
            </defs>
            <path d="M100,150 Q400,100 700,150" stroke="url(#connectionGradient)" stroke-width="2" fill="none" class="animate-pulse">
              <animate attributeName="stroke-dasharray" values="0,1000;1000,0;0,1000" dur="4s" repeatCount="indefinite"/>
            </path>
            <path d="M100,450 Q400,500 700,450" stroke="url(#connectionGradient)" stroke-width="2" fill="none" class="animate-pulse" style="animation-delay: 2s;">
              <animate attributeName="stroke-dasharray" values="0,1000;1000,0;0,1000" dur="4s" repeatCount="indefinite"/>
            </path>
          </svg>
        </div>
      </div>
    </section>

    <!-- Screenshot Placeholder Section -->
    <section class="py-20">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="section-title">See DigiHub in Action</h2>
          <p class="section-subtitle">
            Powerful dashboards and intuitive interfaces designed for efficiency
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-8">
          <div class="bg-gray-100 rounded-2xl p-8 aspect-video flex items-center justify-center">
  <div class="text-center">
    <img 
      src="/connectorDashboard.png" 
      alt="DigiHub Frontend Screenshot"
      class="max-h-full max-w-full object-contain rounded-lg"
    />
        <p class="text-gray-500 text-sm mt-5">Connector Dashboard</p>
  </div>
  
</div>

          
          <div class="bg-gray-100 rounded-2xl p-8 aspect-video flex items-center justify-center">
            <div class="text-center">
    <img 
      src="/shipdashboard.png" 
      alt="Shipping Dashnoard"
      class="max-h-full max-w-full object-contain rounded-lg"
    />
    <p class="text-gray-500 text-sm mt-5">Shipping Dashboard</p>
  </div>
           
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 hero-gradient text-white">
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-4xl md:text-5xl font-bold mb-6">
          Ready to Transform Your E-commerce Operations?
        </h2>
        <p class="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Join thousands of businesses using DigiHub to streamline their multi-channel operations 
          and boost efficiency by 70%.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl text-white font-bold text-lg hover:scale-105 transition-transform duration-300 cursor-pointer shadow-2xl">
            <Icon name="heroicons:rocket-launch" class="w-5 h-5 mr-2" />
            Start Free Trial
          </button>
          <button class="btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Icon name="heroicons:phone" class="w-5 h-5 mr-2" />
            Schedule Demo
          </button>
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
  title: 'DigiHub - E-commerce Channel Connector & Logistics Management System',
  meta: [
    {
      name: 'description',
      content: 'Enterprise-grade multi-marketplace synchronization and logistics platform. Streamline e-commerce operations across multiple sales channels with real-time inventory sync, automated order processing, and multi-carrier shipping integration.'
    },
    {
      property: 'og:title',
      content: 'DigiHub - E-commerce Channel Connector & Logistics Management System'
    },
    {
      property: 'og:description',
      content: 'Transform your e-commerce operations with our comprehensive channel connector and logistics management system. Support for Shopify, WooCommerce, Amazon, and more.'
    }
  ]
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
