<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'

console.log('Компонент App загружен')
console.info('Информационное сообщение')
console.warn('Предупреждение')
console.error('Ошибка')

// Пример с exclude маркером
console.log('@logger-exclude', 'Это сообщение не будет трансформировано')
</script>

<template>
  <div class="container">
    <h1>Demo: vite-plugin-logger</h1>
    <p>Откройте консоль браузера, чтобы увидеть логи с префиксами</p>
    <HelloWorld />
  </div>
</template>

<style scoped>
.container {
  font-family: Arial, sans-serif;
  padding: 2rem;
  text-align: center;
}
</style>
