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

**До:**
```typescript
console.log('Hello')
console.warn('Warning')
console.error('Error')
```

**После:**
```typescript
import { logger as __$vl$__ } from 'vite-plugin-logger/logger';

__$vl$__('my-package', '#ff0000').log('Hello')
__$vl$__('my-package', '#ff0000').warn('Warning')
__$vl$__('my-package', '#ff0000').error('Error')
```

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

## Лицензия

MIT

---

*Документация создана с помощью ИИ*
