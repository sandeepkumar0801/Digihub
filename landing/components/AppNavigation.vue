<template>
  <nav class="w-full bg-slate-900/95 backdrop-blur-md border-b border-white/5 transition-all duration-300 relative z-50">
    <div class="container mx-auto px-6">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center border border-white/10">
            <Icon name="heroicons:cube" class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="font-bold text-xl text-white">DigiHub</div>
            <div class="text-xs text-gray-500 -mt-1"></div>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-12">
          <NuxtLink to="/" class="text-gray-300 hover:text-white font-medium transition-colors text-lg">
            Home
          </NuxtLink>
          <NuxtLink to="/about" class="text-gray-300 hover:text-white font-medium transition-colors text-lg">
            About
          </NuxtLink>
          <div class="relative group">
            <button class="text-gray-300 hover:text-white font-medium transition-colors flex items-center text-lg">
              Features
              <Icon name="heroicons:chevron-down" class="w-4 h-4 ml-1" />
            </button>
              <div class="absolute top-full left-0 mt-2 w-72 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] overflow-hidden">
                <div class="p-2 space-y-1">
                 <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Core Intelligence</div>
                 <NuxtLink to="/cod-risk-intelligence" class="flex items-start px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-red-400 rounded-lg transition-colors group/item">
                    <Icon name="heroicons:shield-check" class="w-5 h-5 mt-0.5 mr-3 text-gray-500 group-hover/item:text-red-500" />
                    <div>
                      <div class="font-semibold">COD Risk Intelligence</div>
                      <div class="text-xs text-gray-500 font-normal">Predict fraud & risks</div>
                    </div>
                 </NuxtLink>
                 <NuxtLink to="/conversion-automation" class="flex items-start px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-green-400 rounded-lg transition-colors group/item">
                    <Icon name="logos:whatsapp-icon" class="w-5 h-5 mt-0.5 mr-3 text-gray-500 group-hover/item:text-green-500" />
                     <div>
                      <div class="font-semibold">Conversion & NDR</div>
                      <div class="text-xs text-gray-500 font-normal">Recover failed orders</div>
                    </div>
                 </NuxtLink>
                 <NuxtLink to="/settlement-orchestration" class="flex items-start px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-yellow-400 rounded-lg transition-colors group/item">
                    <Icon name="heroicons:currency-rupee" class="w-5 h-5 mt-0.5 mr-3 text-gray-500 group-hover/item:text-yellow-500" />
                     <div>
                      <div class="font-semibold">Settlement</div>
                      <div class="text-xs text-gray-500 font-normal">T+0 instant cash flow</div>
                    </div>
                 </NuxtLink>
                 
                 <div class="h-px bg-slate-800 my-2"></div>
                 
                 <NuxtLink to="/add-ons" class="flex items-start px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-blue-400 rounded-lg transition-colors group/item">
                    <Icon name="heroicons:puzzle-piece" class="w-5 h-5 mt-0.5 mr-3 text-gray-500 group-hover/item:text-blue-500" />
                     <div>
                      <div class="font-semibold">Platform Add-ons</div>
                      <div class="text-xs text-gray-500 font-normal">Logistics & Connectors</div>
                    </div>
                 </NuxtLink>
               </div>
             </div>
          </div>
          <NuxtLink to="/contact" class="text-gray-300 hover:text-white font-medium transition-colors">
            Contact
          </NuxtLink>
        </div>

        <!-- CTA Buttons -->
        <div class="hidden md:flex items-center space-x-4">
          
          <button class="bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-sm py-2 px-6 rounded-lg transition-transform hover:scale-105 shadow-lg shadow-orange-500/20">
            <NuxtLink to="/contact">
            Get Started
          </NuxtLink>
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          @click="toggleMobileMenu" 
          class="md:hidden p-2 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
        >
          <Icon name="heroicons:bars-3" class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div 
      v-show="mobileMenuOpen" 
      class="md:hidden bg-black border-t border-slate-800"
    >
      <div class="container mx-auto px-6 py-4 space-y-4">
        <NuxtLink to="/" class="block text-gray-300 hover:text-white font-medium transition-colors">
          Home
        </NuxtLink>
        <NuxtLink to="/about" class="block text-gray-300 hover:text-white font-medium transition-colors">
          About
        </NuxtLink>
          <div class="space-y-2">
            <div class="text-gray-400 font-medium">Core Intelligence</div>
            <div class="pl-4 space-y-2 text-sm">
              <NuxtLink to="/cod-risk-intelligence" class="block text-gray-500 hover:text-red-400 transition-colors">COD Risk Intelligence</NuxtLink>
              <NuxtLink to="/conversion-automation" class="block text-gray-500 hover:text-green-400 transition-colors">Conversion & NDR</NuxtLink>
              <NuxtLink to="/settlement-orchestration" class="block text-gray-500 hover:text-yellow-400 transition-colors">Settlement Orchestration</NuxtLink>
            </div>
             <div class="text-gray-400 font-medium pt-2">Platform</div>
            <div class="pl-4 space-y-2 text-sm">
              <NuxtLink to="/add-ons" class="block text-gray-500 hover:text-blue-400 transition-colors">Add-ons (Logistics, Connectors)</NuxtLink>
            </div>
          </div>
        <NuxtLink to="/contact" class="block text-gray-300 hover:text-white font-medium transition-colors">
          Contact
        </NuxtLink>
        <div class="pt-4 border-t border-slate-800 space-y-2">
          <button class="block w-full text-left text-gray-300 hover:text-white font-medium transition-colors">
            Login
          </button>
          <button class="bg-white text-black w-full font-semibold text-sm py-2 rounded-lg">
            Get Started
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// Close mobile menu when clicking outside or on route change
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('nav')) {
      mobileMenuOpen.value = false
    }
  })
})

// Close mobile menu on route change
watch(() => useRoute().path, () => {
  mobileMenuOpen.value = false
})
</script>
