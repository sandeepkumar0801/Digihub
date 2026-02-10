<template>
  <section class="py-20 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 bg-slate-900/50"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent"></div>
    
    <div class="container mx-auto px-6 relative z-10">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold mb-4 text-white">
          Next-Gen <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Capabilities</span>
        </h2>
        <p class="text-xl text-gray-400">Explore our advanced features designed for scale</p>
      </div>

      <!-- Scrollable Container -->
      <div class="flex overflow-x-auto pb-12 gap-8 snap-x snap-mandatory scrollbar-hide">
        <!-- Intelligent WhatsApp Engagement Card -->
        <div 
          @click="navigateTo('/whatsapp-engagement')"
          class="min-w-[350px] md:min-w-[450px] bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden cursor-pointer group hover:border-green-400/50 transition-all duration-300 snap-center"
        >
          <div class="relative h-64 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 group-hover:opacity-100 transition-opacity duration-300"></div>
            <!-- Animated Icon/Graphic -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <Icon name="logos:whatsapp-icon" class="w-12 h-12 text-white" />
              </div>
              <!-- Floating Elements -->
              <div class="absolute top-10 right-10 w-8 h-8 bg-green-400/30 rounded-full animate-bounce delay-75"></div>
              <div class="absolute bottom-10 left-10 w-6 h-6 bg-emerald-400/30 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
          
          <div class="p-8">
            <h3 class="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">
              Intelligent WhatsApp Engagement
            </h3>
            <p class="text-gray-400 mb-6">
              Reduce RTO (Return to Origin) with active customer confirmation. Verify orders instantly via WhatsApp.
            </p>
            <div class="flex items-center text-green-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
              Learn More <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
            </div>
          </div>
        </div>

        <!-- Smart AI Email Parser Card -->
        <div 
          @click="navigateTo('/smart-email-parser')"
          class="min-w-[350px] md:min-w-[450px] bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden cursor-pointer group hover:border-purple-400/50 transition-all duration-300 snap-center"
        >
          <div class="relative h-64 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 group-hover:opacity-100 transition-opacity duration-300"></div>
            <!-- Animated Icon/Graphic -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <Icon name="heroicons:inbox-arrow-down" class="w-12 h-12 text-white" />
              </div>
              <!-- Floating Elements -->
               <div class="absolute top-12 right-12 w-6 h-6 bg-purple-400/30 rounded sm:rounded-md animate-spin-slow delay-75"></div>
               <div class="absolute bottom-12 left-12 w-4 h-4 bg-indigo-400/30 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
          <div class="p-8">
            <h3 class="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
              Smart AI Email Parser
            </h3>
            <p class="text-gray-400 mb-6">
              Turn unstructured emails into structured orders. AI-powered engine automatically extracts order details.
            </p>
            <div class="flex items-center text-purple-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
              Learn More <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
            </div>
          </div>
        </div>

        <!-- High-Precision Address Intelligence Card -->
        <div 
          @click="navigateTo('/address-intelligence')"
          class="min-w-[350px] md:min-w-[450px] bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden cursor-pointer group hover:border-cyan-400/50 transition-all duration-300 snap-center"
        >
          <div class="relative h-64 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 group-hover:opacity-100 transition-opacity duration-300"></div>
            <!-- Animated Icon/Graphic -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <Icon name="heroicons:map-pin" class="w-12 h-12 text-white" />
              </div>
               <!-- Floating Elements -->
               <div class="absolute top-10 left-16 w-8 h-8 bg-cyan-400/30 rounded-full animate-ping delay-75"></div>
               <div class="absolute bottom-12 right-12 w-4 h-4 bg-blue-400/30 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
          <div class="p-8">
            <h3 class="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
              High-Precision Address Intelligence
            </h3>
            <p class="text-gray-400 mb-6">
              Ship to the right place, every time. AI-driven validation corrects typos and ensures deliverability.
            </p>
            <div class="flex items-center text-cyan-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
              Learn More <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
            </div>
          </div>
        </div>
        
         <!-- Placeholder Card 3 -->
        <!-- Zoho Integration Card -->
        <div 
          @click="navigateTo('/zoho-integration')"
          class="min-w-[350px] md:min-w-[450px] bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden cursor-pointer group hover:border-yellow-400/50 transition-all duration-300 snap-center"
        >
          <div class="relative h-64 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 group-hover:opacity-100 transition-opacity duration-300"></div>
            <!-- Animated Icon -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                <Icon name="heroicons:document-text" class="w-12 h-12 text-white" />
              </div>
               <!-- Floating Elements -->
               <div class="absolute top-12 left-12 w-6 h-6 bg-yellow-400/30 rounded animate-spin-slow"></div>
               <div class="absolute bottom-12 right-12 w-4 h-4 bg-orange-400/30 rounded-full animate-ping delay-300"></div>
            </div>
          </div>
          <div class="p-8">
            <h3 class="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
              Zoho Integration & Compliance
            </h3>
            <p class="text-gray-400 mb-6">
              Seamless accounting and legal compliance. Automated Sales Orders, E-way bill generation, and Invoice syncing.
            </p>
            <div class="flex items-center text-yellow-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
              Learn More <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
const router = useRouter()

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
