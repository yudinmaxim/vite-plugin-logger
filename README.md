# vite-plugin-logger

Vite плагин для автоматической замены `console.*` вызовов на именованный логгер с цветным префиксом пакета.

## Установка

```bash
npm install vite-plugin-logger
```

## Быстрый старт

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

## Конфигурация

### Параметры плагина

| Параметр | Тип | Описание | По умолчанию |
|----------|-----|----------|--------------|
| `packageName` | `string` | Имя пакета для логирования | — |
| `color` | `string` | Цвет фона для префикса | `#d15c5cff` |
| `isLocal` | `boolean` | Локальный режим (без проверки зависимостей) | `false` |
| `exclude` | `string[]` | Массив паттернов файлов для игнорирования | `[]` |

### Объектная конфигурация

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import loggerPlugin from 'vite-plugin-logger'

export default defineConfig({
  plugins: [
    loggerPlugin({
      packageName: 'my-package',
      color: '#ff0000',
      isLocal: true,
      exclude: ['api.worker*']
    })
  ]
})
```

## Как работает трансформация

Плагин использует Vite-хук `transform` с `enforce: 'pre'` для обработки JS/TS/Vue файлов.

### Что заменяется

| Исходный код | Результат |
|--------------|-----------|
| `console.log(...)` | `logger('name', '#color').log(...)` |
| `console.info(...)` | `logger('name', '#color').info(...)` |
| `console.warn(...)` | `logger('name', '#color').warn(...)` |
| `console.error(...)` | `logger('name', '#color').error(...)` |
| `console.debug(...)` | `logger('name', '#color').debug(...)` |

### Пример трансформации

**Исходный код:**
```typescript
// src/main.ts
console.log('Приложение запускается')

// src/App.vue
console.log('Компонент загружен')
console.info('Информация')
console.warn('Предупреждение')
console.error('Ошибка')
```

**После сборки:**
```javascript
// Добавляется импорт логгера
import { logger as __$vl$__ } from 'vite-plugin-logger/logger';

// Трансформированные вызовы
__$vl$__('my-package', '#ff0000').log('Приложение запускается')
__$vl$__('my-package', '#ff0000').log('Компонент загружен')
__$vl$__('my-package', '#ff0000').info('Информация')
__$vl$__('my-package', '#ff0000').warn('Предупреждение')
__$vl$__('my-package', '#ff0000').error('Ошибка')
```

### После минификации Rollup

```javascript
// Импорт после минификации
import{logger as Gt}from"vite-plugin-logger/logger";

// Вызовы после минификации
Gt("my-package","#ff0000").log("Приложение запускается")
Gt("my-package","#ff0000").log("Компонент загружен")
Gt("my-package","#ff0000").info("Информация")
Gt("my-package","#ff0000").warn("Предупреждение")
Gt("my-package","#ff0000").error("Ошибка")
```

## Исключение вызовов из трансформации

Добавьте `@logger-exclude` первым аргументом:

```typescript
console.log('@logger-exclude', 'Этот вызов не будет трансформирован')
// → console.log('Этот вызов не будет трансформирован')
```

## API логгера

```typescript
import { logger } from 'vite-plugin-logger/logger'

const log = logger('my-package', '#ff0000')

log.log('message')
log.warn('warning')
log.error('error')
log.debug('debug')
```

### Конфигурация

```typescript
import { configureLogger } from 'vite-plugin-logger/logger'

configureLogger({
  level: 'warn', // 'debug' | 'info' | 'warn' | 'error'
  enabled: true
})
```

#### Параметры конфигурации

| Параметр | Тип | Описание |
|----------|-----|----------|
| `level` | `'debug' \| 'info' \| 'warn' \| 'error'` | Уровень логирования. Определяет какие методы будут выводиться в консоль |
| `enabled` | `boolean` | Включить/выключить логирование глобально |

#### Уровни логирования

- **`debug`** — выводятся все сообщения: `debug`, `log`, `info`, `warn`, `error`
- **`info`** — выводятся: `log`, `info`, `warn`, `error`
- **`warn`** — выводятся: `warn`, `error`
- **`error`** — выводятся только: `error`

Пример:
```typescript
configureLogger({ level: 'warn' })

logger('my-package').debug('Это не выведется')  // пропущено
logger('my-package').log('Это не выведется')    // пропущено
logger('my-package').info('Это не выведется')   // пропущено
logger('my-package').warn('Выведется')          // ✓
logger('my-package').error('Выведется')         // ✓
```

### Опции логгера

```typescript
const log = logger('my-package')
log.options    // { level, enabled, name, backgroundColor }
log.setOptions({ level: 'error' })
```

## Пример проекта

```bash
# Запустить dev-сервер
pnpm dev:example

# Собрать пример
pnpm build:example
```

Пример находится в `examples/demo-vue/`.

## Лицензия

MIT

---

*Документация создана с помощью ИИ*