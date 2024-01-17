<template>
    <nav class="bg-white border-b shadow-lg">
        <div class="max-w-6xl mx-auto px-4">
            <div class="flex justify-between">
                <div>
                    <!-- Website Logo -->
                    <router-link :to="{ name: 'home' }" class="flex items-center py-4">
                        <img :src=logo alt="Logo" class="h-16  mr-2">
                    </router-link>
                </div>
                <!-- Primary Navbar items -->
                <div class="hidden md:flex items-center space-x-1">
                    <router-link :to="{ name: 'home' }"
                        activeClass="border-b-4 border-purple-400"
                        class="py-4 px-2 text-gray-400 font-semibold hover:text-purple-400 transition duration-300">Home</router-link>
                    <router-link :to="{ name: 'tools' }"
                        activeClass="border-b-4 border-purple-400"
                        class="py-4 px-2 text-gray-400 font-semibold hover:text-purple-400 transition duration-300">Tools</router-link>
                    <a href="https://github.com/JStruk/UtilsNinja"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="py-4 px-2 text-gray-400 font-semibold hover:text-purple-400 transition duration-300">Contribute</a>
                    <a href="#contact"
                        class="py-4 px-2 text-gray-400 font-semibold hover:text-purple-400 transition duration-300">Contact</a>
                </div>
                <!-- Mobile menu button -->
                <div class="md:hidden flex items-center">
                    <button class="outline-none mobile-menu-button" @click="toggleMenu">
                        <svg class=" w-6 h-6 text-gray-400 hover:text-purple-400 " x-show="!showMenu" fill="none"
                            stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <!-- mobile menu -->
        <div class="mobile-menu" v-show="!collapsed">
            <ul class="">
                <li><router-link :to="{ name: 'home' }"
                        @click="toggleMenu"
                        activeClass="bg-purple-400 text-white font-semibold"
                        class="block text-sm px-2 py-4 hover:bg-purple-400 transition duration-300">Home</router-link></li>
                <li><router-link :to="{ name: 'tools' }"
                        @click="toggleMenu"
                        activeClass="bg-purple-400 text-white font-semibold"
                        class="block text-sm px-2 py-4 hover:bg-purple-400 transition duration-300">Tools</router-link></li>
                <li><a href="https://github.com/JStruk/UtilsNinja"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="block text-sm px-2 py-4 hover:bg-purple-400 transition duration-300">Contribute</a></li>
                <li><a href="#contact"
                        class="block text-sm px-2 py-4 hover:bg-purple-400 transition duration-300">Contact</a></li>
            </ul>
        </div>
    </nav>
</template>

<script lang="ts" setup>
import logo from '../assets/utilsninjalogo.png'

import { ref } from 'vue'

let collapsed = ref(true)

const toggleMenu = () => { collapsed.value = !collapsed.value }
</script>