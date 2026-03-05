<script setup lang="ts">
console.log('HelloWorld: компонент инициализирован')

const message = 'Привет от vite-plugin-logger!'
console.log('Сообщение:', message)

const showAlert = () => {
  console.info('Кнопка нажата!')
  alert('Hello from logger!')
}

console.debug('Отладочное сообщение')
</script>

<template>
  <div class="hello">
    <button @click="showAlert">Нажми меня</button>
  </div>
</template>

<style scoped>
.hello {
  margin-top: 2rem;
}
button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}
</style>
