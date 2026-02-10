<template>
  <div class="min-h-screen bg-slate-900 text-white">
    <!-- Navigation -->
    <AppNavigation />

    <section class="relative pt-32 pb-20 overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0 bg-slate-900">
        <div class="absolute inset-0 bg-gradient-to-br from-green-900/20 via-slate-900 to-slate-900"></div>
        <div class="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-green-500/10 to-transparent blur-3xl rounded-full"></div>
      </div>

      <div class="container mx-auto px-6 relative z-10">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div class="inline-flex items-center px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-semibold mb-6">
              <Icon name="logos:whatsapp-icon" class="w-4 h-4 mr-2" />
              Intelligent Engagement
            </div>
            
            <h1 class="text-5xl md:text-7xl font-black mb-8 leading-tight">
              Slash RTO with <br>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Active Confirmation</span>
            </h1>
            
            <p class="text-xl text-gray-300 mb-10 leading-relaxed">
              Automate customer verification via WhatsApp. Detect high-risk orders instantly and get confirmation before shipping to drastically reduce Return to Origin (RTO) rates.
            </p>
            
            <button class="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-500/25 flex items-center">
              Start Free Trial
              <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
            </button>
          </div>

          <div class="relative">
            <!-- Mockup -->
            <div class="relative bg-white text-gray-900 rounded-[2.5rem] p-6 shadow-2xl max-w-sm mx-auto border-8 border-slate-800">
              <div class="space-y-4">
                 <!-- Header -->
                <div class="flex items-center space-x-3 border-b border-gray-100 pb-4">
                  <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <Icon name="heroicons:building-storefront" class="w-6 h-6" />
                  </div>
                  <div>
                    <div class="font-bold">Your Store</div>
                    <div class="text-xs text-gray-500">Business Account</div>
                  </div>
                </div>

                <!-- Message 1 -->
                <div class="bg-green-50 p-3 rounded-lg rounded-tl-none max-w-[85%]">
                  <p class="text-sm">Hi John! 👋 Thanks for your order #12345.</p>
                </div>

                 <!-- Message 2 -->
                <div class="bg-green-50 p-3 rounded-lg rounded-tl-none max-w-[85%]">
                  <p class="text-sm">Please confirm your delivery address to proceed with shipping.</p>
                  <div class="mt-2 bg-white p-2 rounded border border-gray-200">
                     <div class="font-semibold text-xs text-gray-500 mb-1">Delivery Address</div>
                     <div class="text-sm">123 Main St, Apt 4B, New York, NY</div>
                  </div>
                </div>

                <!-- User Reply -->
                <div class="flex justify-end">
                   <div class="bg-green-500 text-white p-3 rounded-lg rounded-tr-none max-w-[85%] shadow-md">
                    <p class="text-sm">Yes, that's correct! ✅</p>
                  </div>
                </div>
                 
                 <!-- Confirmation -->
                  <div class="bg-green-50 p-3 rounded-lg rounded-tl-none max-w-[85%]">
                  <p class="text-sm">Great! We've confirmed your order. You'll receive tracking details shortly. 🚚</p>
                </div>

              </div>
              
              <!-- Floating Badge -->
              <div class="absolute -right-12 top-1/2 -translate-y-1/2 bg-white p-4 rounded-xl shadow-xl animate-bounce hidden md:block">
                 <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span class="font-bold text-gray-900">Order Confirmed</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- How it works -->
    <section class="py-20 bg-slate-800/50">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                <p class="text-gray-400">Simple, automated workflow to secure your revenue</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-8">
                 <div class="p-8 bg-slate-800 rounded-2xl border border-slate-700">
                    <div class="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6">
                        <Icon name="heroicons:shopping-cart" class="w-6 h-6" />
                    </div>
                    <h3 class="text-xl font-bold mb-3">1. Order Placed</h3>
                    <p class="text-gray-400">Customer places a COD or prepaid order on your website.</p>
                 </div>
                 
                 <div class="p-8 bg-slate-800 rounded-2xl border border-slate-700">
                    <div class="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 mb-6">
                        <Icon name="logos:whatsapp-icon" class="w-6 h-6" />
                    </div>
                    <h3 class="text-xl font-bold mb-3">2. Auto-Verification</h3>
                    <p class="text-gray-400">Our system automatically sends a WhatsApp message to confirm details.</p>
                 </div>
                 
                 <div class="p-8 bg-slate-800 rounded-2xl border border-slate-700">
                    <div class="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6">
                        <Icon name="heroicons:check-badge" class="w-6 h-6" />
                    </div>
                    <h3 class="text-xl font-bold mb-3">3. Ship or Flag</h3>
                    <p class="text-gray-400">Confirmed orders are pushed to shipping; risky ones are flagged for review.</p>
                 </div>
            </div>
        </div>
    </section>
  </div>
</template>

<script setup>
</script>
