# vite-plugin-logger

Vite плагин для автоматической замены `console.*` вызовов на именованный логгер с цветным префиксом пакета.

## Установка

```bash
npm install vite-plugin-logger
```

## Использование

### Быстрый старт

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import loggerPlugin from 'vite-plugin-logger'

export default defineConfig({
  plugins: [
    loggerPlugin('my-package', '#ff0000')
  ]
})
```

### Конфигурация объектом

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import loggerPlugin from 'vite-plugin-logger'

export default defineConfig({
  plugins: [
    loggerPlugin({
      packageName: 'my-package',
      color: '#ff0000',
      isLocal: false,
      exclude: ['api.worker*']
    })
  ]
})
```

### Параметры

| Параметр | Тип | Описание | По умолчанию |
|----------|-----|----------|--------------|
| `packageName` | `string` | Имя пакета для логирования | — |
| `color` | `string` | Цвет фона для префикса | `#d15c5cff` |
| `isLocal` | `boolean` | Локальный режим (без проверки зависимостей) | `false` |
| `exclude` | `string[]` | Массив паттернов файлов для игнорирования | `[]` |

### До и после трансформации

**До (исходный код):**
```typescript
// src/main.ts
console.log('Приложение запускается')

// src/App.vue
console.log('Компонент App загружен')
console.info('Информационное сообщение')
console.warn('Предупреждение')
console.error('Ошибка')

// src/components/HelloWorld.vue
console.log('HelloWorld: компонент инициализирован')
console.info('Кнопка нажата!')
console.debug('Отладочное сообщение')
```

**После (скомпилированный бандл):**
```javascript
// main.ts → в бандле
Gt("demo-vue","#42b883").log("Приложение запускается")

// App.vue → в бандле
Gt("demo-vue","#42b883").log("Компонент App загружен")
Gt("demo-vue","#42b883").info("Информационное сообщение")
Gt("demo-vue","#42b883").warn("Предупреждение")
Gt("demo-vue","#42b883").error("Ошибка")

// HelloWorld.vue → в бандле
Gt("demo-vue","#42b883").log("HelloWorld: компонент инициализирован")
Gt("demo-vue","#42b883").info("Кнопка нажата!")
Gt("demo-vue","#42b883").debug("Отладочное сообщение")
```

> **Примечание:** После минификации Rollup имена переменных сокращаются. В режиме разработки вы увидите `__$vl$__`, а в продакшн-сборке — сокращённые имена (например, `Gt`).
> 
> В этом примере используется конфигурация:
> ```typescript
> loggerPlugin({
>   packageName: 'demo-vue',
>   color: '#42b883', // зелёный цвет (цвет Vue)
>   isLocal: true
> })
> ```

### Исключение файлов из трансформации

Добавьте `@logger-exclude` в аргументы console вызова:

```typescript
console.log('@logger-exclude', 'Этот вызов не будет трансформирован')
```

### Глобальная конфигурация логгера

Логгер можно настроить глобально:

```typescript
import { configureLogger } from 'vite-plugin-logger/logger'

configureLogger({
  level: 'warn', // 'debug' | 'info' | 'warn' | 'error'
  enabled: true
})
```

## API логгера

```typescript
import { logger } from 'vite-plugin-logger/logger'

const log = logger('my-package', '#ff0000')

log.log('info message')
log.warn('warning message')
log.error('error message')
log.debug('debug message')
```

### Доступ к опциям

```typescript
const log = logger('my-package')
console.log(log.options) // { level, enabled, name, backgroundColor }

// Изменение опций
log.setOptions({ level: 'error' })
```

## Пример проекта

В репозитории есть пример Vue-приложения с подключённым плагином:

```bash
# Перейти в директорию примера
cd examples/demo-vue

# Запустить dev-сервер
pnpm dev

# Собрать проект
pnpm build
```

Исходный код примера находится в папке `examples/demo-vue/`.

## Лицензия

MIT

---

*Документация создана с помощью ИИ*
