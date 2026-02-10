<template>
  <div class="min-h-screen bg-black text-white selection:bg-red-500 selection:text-white">
    <AppNavigation />

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 overflow-hidden">
       <!-- Background -->
        <div class="absolute inset-0 bg-black">
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black"></div>
             <!-- Cyber Grid -->
             <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(#dc2626 1px, transparent 1px), linear-gradient(90deg, #dc2626 1px, transparent 1px); background-size: 50px 50px; transform: perspective(100vh) rotateX(60deg) translateY(-100px) scale(2);"></div>
        </div>

        <div class="container mx-auto px-6 relative z-10">
            <div class="max-w-4xl mx-auto text-center">
                 <div class="inline-flex items-center px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-500 text-sm font-semibold mb-8 tracking-widest uppercase">
                  <span class="w-2 h-2 bg-red-500 rounded-full animate-ping mr-3"></span>
                  Threat Detection
                </div>
                
                <h1 class="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tight">
                  Predict Risk.<br>
                  <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-gradient">Secure Revenue.</span>
                </h1>
                
                <p class="text-2xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto">
                    The advanced AI engine that scores every COD order in milliseconds. Detect fraud, reduce RTO, and automatically convert high-risk orders to <span class="text-white font-bold border-b-2 border-red-500">Partial Payments</span>.
                </p>
                
                <div class="flex flex-col sm:flex-row gap-6 justify-center">
                    <button class="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-xl font-bold text-xl transition-all shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:shadow-[0_0_50px_rgba(220,38,38,0.7)] hover:scale-105 flex items-center">
                    Activate Risk Shield
                    <Icon name="heroicons:shield-check" class="ml-3 w-6 h-6" />
                    </button>
                    <button class="border border-white/20 hover:bg-white/5 text-white px-10 py-5 rounded-xl font-bold text-xl transition-all flex items-center">
                    Simulate Risk
                    <Icon name="heroicons:beaker" class="ml-3 w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- The 100+ Parameter Scan -->
    <section class="py-24 bg-black relative border-t border-slate-900">
        <div class="container mx-auto px-6">
             <div class="text-center mb-20">
                 <h2 class="text-3xl md:text-5xl font-black text-white mb-6">The 100+ Parameter Scan</h2>
                 <p class="text-gray-400 max-w-2xl mx-auto">
                    As soon as 'Place Order' is clicked, our engine runs a millisecond-fast check across four key pillars.
                 </p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <!-- Pillar 1: Network History -->
                <div class="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-blue-500/50 transition-all duration-300 group">
                    <div class="w-14 h-14 bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                        <Icon name="heroicons:globe-americas" class="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Network History</h3>
                    <p class="text-sm text-gray-400">Has this buyer frequently rejected COD orders across our network of 5,000+ stores?</p>
                </div>

                <!-- Pillar 2: Address Validation -->
                <div class="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-purple-500/50 transition-all duration-300 group">
                    <div class="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                        <Icon name="heroicons:map-pin" class="w-8 h-8 text-purple-500" />
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Address Validation</h3>
                    <p class="text-sm text-gray-400">We detect gibberish, incomplete house numbers, and "blacklisted" pin codes.</p>
                </div>

                <!-- Pillar 3: Identity Verification -->
                <div class="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-orange-500/50 transition-all duration-300 group">
                    <div class="w-14 h-14 bg-orange-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
                        <Icon name="heroicons:device-phone-mobile" class="w-8 h-8 text-orange-500" />
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Identity Verification</h3>
                    <p class="text-sm text-gray-400">Is the phone active? Is it a virtual number often used for bot-orders?</p>
                </div>

                <!-- Pillar 4: User Intent -->
                <div class="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-red-500/50 transition-all duration-300 group">
                    <div class="w-14 h-14 bg-red-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
                        <Icon name="heroicons:cursor-arrow-rays" class="w-8 h-8 text-red-500" />
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">User Intent</h3>
                    <p class="text-sm text-gray-400">Behavioral analysis: Did they rush checkout? Do they look genuine?</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Dynamic Interventions -->
    <section class="py-24 bg-slate-950 relative overflow-hidden">
        <!-- Background Glow -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>
        
        <div class="container mx-auto px-6 relative z-10">
            <div class="text-center mb-20">
                 <h2 class="text-3xl md:text-5xl font-black text-white mb-6">Dynamic Interventions</h2>
                 <p class="text-gray-400 max-w-2xl mx-auto">
                    Don't just block orders. Optimize them. We create a <span class="text-white font-semibold">Dynamic Checkout Experience</span> based on the risk profile.
                 </p>
            </div>

            <div class="grid lg:grid-cols-3 gap-8">
                 <!-- Green Zone -->
                 <div class="bg-gradient-to-b from-green-900/10 to-slate-900/50 border border-green-500/20 rounded-3xl p-8 relative overflow-hidden group">
                     <div class="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                     <div class="inline-flex items-center px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full mb-6 border border-green-500/20">
                        THE GREEN ZONE
                     </div>
                     <h3 class="text-2xl font-bold text-white mb-2">Low Risk</h3>
                     <p class="text-gray-400 mb-8 text-sm">Genuine, high-intent buyers.</p>
                     
                     <div class="bg-black/40 rounded-xl p-4 border border-green-500/10 mb-4">
                        <div class="flex items-center text-green-400 font-bold mb-2">
                            <Icon name="heroicons:check-circle" class="w-5 h-5 mr-2" />
                            1-Click Confirmation
                        </div>
                        <p class="text-xs text-gray-500">Zero friction. Max conversion.</p>
                     </div>
                 </div>

                 <!-- Amber Zone -->
                 <div class="bg-gradient-to-b from-yellow-900/10 to-slate-900/50 border border-yellow-500/20 rounded-3xl p-8 relative overflow-hidden group">
                     <div class="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                     <div class="inline-flex items-center px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded-full mb-6 border border-yellow-500/20">
                        THE AMBER ZONE
                     </div>
                     <h3 class="text-2xl font-bold text-white mb-2">Medium Risk</h3>
                     <p class="text-gray-400 mb-8 text-sm">Suspicious signals or new users.</p>
                     
                     <div class="bg-black/40 rounded-xl p-4 border border-yellow-500/10 mb-4">
                        <div class="flex items-center text-yellow-400 font-bold mb-2">
                            <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-5 h-5 mr-2" />
                            Automated Verification
                        </div>
                        <p class="text-xs text-gray-500">WhatsApp / IVR check to confirm intent.</p>
                     </div>
                 </div>

                 <!-- Red Zone -->
                 <div class="bg-gradient-to-b from-red-900/10 to-slate-900/50 border border-red-500/20 rounded-3xl p-8 relative overflow-hidden group">
                     <div class="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                     <div class="inline-flex items-center px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-full mb-6 border border-red-500/20">
                        THE RED ZONE
                     </div>
                     <h3 class="text-2xl font-bold text-white mb-2">High Risk / Value</h3>
                     <p class="text-gray-400 mb-8 text-sm">Potential fraud or very expensive orders.</p>
                     
                     <div class="bg-black/40 rounded-xl p-4 border border-red-500/10 mb-4">
                        <div class="flex items-center text-red-400 font-bold mb-2">
                            <Icon name="heroicons:banknotes" class="w-5 h-5 mr-2" />
                            Partial Payment
                        </div>
                        <p class="text-xs text-gray-500">Pay small booking fee to confirm.</p>
                     </div>
                 </div>
            </div>
        </div>
    </section>

    <!-- Value Addition Metrics -->
    <section class="py-24 bg-black border-t border-slate-900">
        <div class="container mx-auto px-6">
            <div class="grid md:grid-cols-3 gap-12 text-center">
                <div>
                    <div class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-4">45%</div>
                    <div class="text-xl font-bold text-white mb-2">Reduce RTO</div>
                    <p class="text-sm text-gray-400">Stop shipping to addresses that don't exist.</p>
                </div>
                <div>
                     <div class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 mb-4">2x</div>
                    <div class="text-xl font-bold text-white mb-2">Save on Shipping</div>
                    <p class="text-sm text-gray-400">Avoid forward & reverse logistics costs.</p>
                </div>
                <div>
                     <div class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-green-500 mb-4">100%</div>
                    <div class="text-xl font-bold text-white mb-2">Unlock Inventory</div>
                    <p class="text-sm text-gray-400">Keep best-sellers available for real buyers.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Case Study -->
    <section class="py-24 bg-slate-900/50">
        <div class="container mx-auto px-6">
            <div class="bg-gradient-to-br from-slate-900 to-black border border-slate-800 rounded-3xl p-8 md:p-16 relative overflow-hidden">
                 <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-900/10 to-transparent pointer-events-none"></div>

                 <div class="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                     <div>
                         <div class="inline-flex items-center px-4 py-2 bg-red-500/10 text-red-400 text-xs font-bold rounded-full mb-8">CASE STUDY</div>
                         <h2 class="text-4xl md:text-5xl font-black text-white mb-6">Scale Without The Burn</h2>
                         <p class="text-lg text-gray-400 mb-8 leading-relaxed">
                             <strong class="text-white">A high-growth electronics brand</strong> selling premium headphones (₹8,000+) faced a 40% RTO rate, killing their marketing ROI. 
                             <br><br>
                             They integrated our Risk Intelligence with a Partial Payment nudge for "Medium Risk" orders.
                         </p>
                         <button class="text-red-400 font-bold hover:text-red-300 flex items-center transition-colors">
                             Read Full Story <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5"/>
                         </button>
                     </div>
                     
                     <div class="bg-black/50 border border-slate-700 rounded-2xl p-8">
                         <div class="space-y-6">
                             <div class="flex justify-between items-center border-b border-slate-700 pb-4">
                                 <div class="text-gray-400">Fraud Orders</div>
                                 <div class="text-green-500 font-bold flex items-center"><Icon name="heroicons:arrow-trending-down" class="w-4 h-4 mr-2"/> Near Zero</div>
                             </div>
                             <div class="flex justify-between items-center border-b border-slate-700 pb-4">
                                 <div class="text-gray-400">RTO Rate</div>
                                 <div class="text-green-500 font-bold flex items-center"><Icon name="heroicons:arrow-trending-down" class="w-4 h-4 mr-2"/> -28% (Month 1)</div>
                             </div>
                             <div class="flex justify-between items-center">
                                 <div class="text-gray-400">Net Profit</div>
                                 <div class="text-green-500 font-bold flex items-center"><Icon name="heroicons:arrow-trending-up" class="w-4 h-4 mr-2"/> +15%</div>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="py-20 bg-red-600 text-white text-center">
        <div class="container mx-auto px-6">
            <h2 class="text-4xl font-black mb-8">Ready to Protect Your Profits?</h2>
            <p class="text-xl mb-10 max-w-2xl mx-auto opacity-90">Integrate our Risk Intelligence API with your Shopify, WooCommerce, or Custom store in under 10 minutes.</p>
            <div class="flex flex-col sm:flex-row gap-6 justify-center">
                <button class="bg-black text-white px-10 py-5 rounded-xl font-bold text-xl hover:scale-105 transition-transform shadow-2xl">
                    Get Free Risk Audit
                </button>
                    <button class="bg-white/10 border border-white/20 text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-white/20 transition-all">
                    View Documentation
                </button>
            </div>
        </div>
    </section>
  </div>
</template>

<script setup>
</script>
