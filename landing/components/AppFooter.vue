<template>
  <footer class="bg-gray-900 text-white py-16">
    <div class="container mx-auto px-6">
      <div class="grid md:grid-cols-4 gap-8">
        <!-- Company Info -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Icon name="heroicons:cube" class="w-7 h-7 text-white" />
            </div>
            <div>
              <div class="font-bold text-2xl">DigiHub</div>
              <div class="text-sm text-gray-400"></div>
            </div>
          </div>
          <p class="text-gray-300 mb-6 max-w-md leading-relaxed">
            Enterprise-grade multi-marketplace synchronization and logistics platform 
            designed to streamline e-commerce operations across multiple sales channels 
            and shipping providers.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
              <Icon name="heroicons:globe-alt" class="w-5 h-5" />
            </a>
            <a href="#" class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
              <Icon name="heroicons:envelope" class="w-5 h-5" />
            </a>
            <a href="#" class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
              <Icon name="heroicons:phone" class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="font-semibold text-lg mb-4">Quick Links</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/" class="text-gray-300 hover:text-white transition-colors">
                Home
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/about" class="text-gray-300 hover:text-white transition-colors">
                About Us
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="text-gray-300 hover:text-white transition-colors">
                Contact
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Features -->
        <div>
          <h3 class="font-semibold text-lg mb-4">Features</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/cod-risk-intelligence" class="text-gray-300 hover:text-white transition-colors">
                COD Risk Intelligence
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/conversion-automation" class="text-gray-300 hover:text-white transition-colors">
                Conversion & NDR
              </NuxtLink>
            </li>
             <li>
              <NuxtLink to="/settlement-orchestration" class="text-gray-300 hover:text-white transition-colors">
                Settlement
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/features/multi-channel-integration" class="text-gray-300 hover:text-white transition-colors">
                Multi-Channel Integration
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/features/real-time-synchronization" class="text-gray-300 hover:text-white transition-colors">
                Real-time Synchronization
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/features/order-processing" class="text-gray-300 hover:text-white transition-colors">
                Order Processing
              </NuxtLink>
            </li>
             <li>
              <NuxtLink to="/features/logistics-management" class="text-gray-300 hover:text-white transition-colors">
                Logistics Management
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/features/real-time-tracking" class="text-gray-300 hover:text-white transition-colors">
                Real-time Tracking
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-800 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center">
        <div class="text-gray-400 text-sm">
          © {{ new Date().getFullYear() }} DigiHub. All rights reserved.
        </div>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">
            Privacy Policy
          </a>
          <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">
            Terms of Service
          </a>
          <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">
            Cookie Policy
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
