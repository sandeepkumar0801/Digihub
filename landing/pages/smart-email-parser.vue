<template>
  <div class="min-h-screen bg-slate-900 text-white">
    <!-- Navigation -->
    <AppNavigation />

    <section class="relative pt-32 pb-20 overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0 bg-slate-900">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-900 to-slate-900"></div>
        <div class="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl rounded-full"></div>
      </div>

      <div class="container mx-auto px-6 relative z-10">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
             <!-- Text Content -->
          <div>
            <div class="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-semibold mb-6">
              <Icon name="heroicons:sparkles" class="w-4 h-4 mr-2" />
              AI Automation
            </div>
            
            <h1 class="text-5xl md:text-7xl font-black mb-8 leading-tight">
              Turn Unstructured Emails into <br>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Structured Orders</span>
            </h1>
            
            <p class="text-xl text-gray-300 mb-10 leading-relaxed">
              Stop manual data entry. Our AI engine reads emails, extracts order details, and syncs them to your system automatically. Faster, error-free, and scalable.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-4">
                <button class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center">
                Get Started
                <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
                </button>
                <button class="border border-purple-500/30 hover:bg-purple-500/10 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center">
                View Demo
                <Icon name="heroicons:play" class="ml-2 w-5 h-5" />
                </button>
            </div>
          </div>

           <!-- Interactive Visualization -->
          <div class="relative">
             <!-- Email Card -->
            <div class="relative bg-white text-gray-900 rounded-2xl p-6 shadow-2xl max-w-sm mx-auto border-4 border-slate-700 transform -rotate-3 hover:rotate-0 transition-transform duration-500 z-10">
               <div class="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                 <div class="font-bold text-lg">New Order Request</div>
                 <div class="text-xs text-gray-400">Today, 10:23 AM</div>
               </div>
               <div class="space-y-2 text-sm text-gray-600">
                 <p>Hi,</p>
                 <p>I'd like to order <span class="bg-yellow-100 px-1 rounded font-semibold text-gray-900 border border-yellow-200">50 units</span> of <span class="bg-yellow-100 px-1 rounded font-semibold text-gray-900 border border-yellow-200">Wireless Headphones (SKU: WH-001)</span>.</p>
                 <p>Please ship to:</p>
                 <p class="bg-yellow-100 p-2 rounded border border-yellow-200 text-gray-900 italic">
                   John Doe<br>
                   123 Tech Park, Suite 400<br>
                   San Francisco, CA 94107
                 </p>
                 <p>Thanks,<br>John</p>
               </div>
            </div>

            <!-- Arrow -->
             <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                 <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                     <Icon name="heroicons:arrow-down" class="w-6 h-6 text-white" />
                 </div>
             </div>

            <!-- Extracted Data Card -->
             <div class="relative bg-slate-800 text-white rounded-2xl p-6 shadow-2xl max-w-sm mx-auto border border-purple-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-500 mt-[-40px]">
               <div class="flex items-center space-x-2 border-b border-slate-700 pb-4 mb-4">
                 <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                 <div class="font-bold text-lg text-purple-400">Structured Data</div>
               </div>
               <div class="space-y-3 font-mono text-sm">
                 <div class="flex justify-between">
                   <span class="text-gray-400">Customer:</span>
                   <span class="text-green-400">John Doe</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-gray-400">SKU:</span>
                   <span class="text-blue-400">WH-001</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-gray-400">Quantity:</span>
                   <span class="text-yellow-400">50</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-gray-400">Address:</span>
                   <span class="text-purple-400 text-right w-1/2 truncate">123 Tech Park, SF</span>
                 </div>
               </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
    
    <!-- Capabilities -->
    <section class="py-20 bg-slate-800/50">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Smart Capabilities</h2>
                <p class="text-gray-400">More than just parsing. It understands context.</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-8">
                 <!-- Smart Extraction -->
                 <div class="group p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-purple-500/50 transition-colors">
                    <div class="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                        <Icon name="heroicons:document-magnifying-glass" class="w-7 h-7" />
                    </div>
                    <h3 class="text-xl font-bold mb-3 text-white">Smart Extraction</h3>
                    <p class="text-gray-400">Identifies Customer Name, SKU, Quantity, and Address from free-text body using NLP.</p>
                 </div>
                 
                 <!-- Context Awareness -->
                 <div class="group p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-colors">
                    <div class="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                        <Icon name="heroicons:user-circle" class="w-7 h-7" />
                    </div>
                    <h3 class="text-xl font-bold mb-3 text-white">Context Awareness</h3>
                    <p class="text-gray-400">Uses email metadata to fill gaps (e.g., sender name, organization) when not explicitly stated.</p>
                 </div>
                 
                 <!-- Validation -->
                 <div class="group p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-pink-500/50 transition-colors">
                    <div class="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                        <Icon name="heroicons:exclamation-triangle" class="w-7 h-7" />
                    </div>
                    <h3 class="text-xl font-bold mb-3 text-white">Auto-Validation</h3>
                    <p class="text-gray-400">Flags missing mandatory fields and automatically drafts a reply asking for specific details.</p>
                 </div>
            </div>
        </div>
    </section>

    <!-- Use Case Stats -->
    <section class="py-20 bg-slate-900 border-t border-slate-800">
        <div class="container mx-auto px-6">
             <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                    <div class="text-4xl font-black text-purple-500 mb-2">95%</div>
                    <div class="text-gray-400 text-sm uppercase tracking-wider">Time Saved</div>
                </div>
                 <div>
                    <div class="text-4xl font-black text-indigo-500 mb-2">99.9%</div>
                    <div class="text-gray-400 text-sm uppercase tracking-wider">Accuracy</div>
                </div>
                 <div>
                    <div class="text-4xl font-black text-cyan-500 mb-2">24/7</div>
                    <div class="text-gray-400 text-sm uppercase tracking-wider">Processing</div>
                </div>
                 <div>
                    <div class="text-4xl font-black text-pink-500 mb-2">0</div>
                    <div class="text-gray-400 text-sm uppercase tracking-wider">Manual Entry</div>
                </div>
             </div>
        </div>
    </section>
  </div>
</template>

<script setup>
</script>
