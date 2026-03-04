# Логгер и плагин vite-plugin-logger

## Новый формат исключений из трансформации

Ранее для исключения вызовов `console` из трансформации использовались комментарии в формате:

```javascript
// @logger-exclude
console.log('Этот вызов не будет трансформирован')
```

Однако, из-за того что плагин `vite-plugin-logger` выполняется с `enforce: 'post'`, к моменту его работы комментарии уже убраны из кода, и механизм исключения не работает.

### Новый подход

Теперь для исключения вызовов `console` из трансформации используется специальный маркер в самих аргументах вызова:

```javascript
console.log("@logger-exclude", "Этот вызов не будет трансформирован")
```

Плагин автоматически распознает такие вызовы и удаляет маркер "@logger-exclude" из аргументов, оставляя остальные аргументы без изменений:

```javascript
console.log("Этот вызов не будет трансформирован")
```

### Поддерживаемые методы console

Плагин поддерживает исключение для следующих методов console:
- log
- info
- warn
- error
- debug
- trace
- dir
- dirxml
- table
- group
- groupCollapsed
- groupEnd
- time
- timeEnd
- timeLog
- count
- countReset
- assert
- clear
- profile
- profileEnd

### Примеры

Было:
```javascript
// @logger-exclude
console.error('sendWorkerError', error, place, port, messageData)
```

Стало:
```javascript
console.error("@logger-exclude", 'sendWorkerError', error, place, port, messageData)
```

После трансформации плагином:
```javascript
console.error('sendWorkerError', error, place, port, messageData)
```

Было:
```javascript
// @logger-exclude
console.log('check retryCount: ', { retryCount, port, messageData })
```

Стало:
```javascript
console.log("@logger-exclude", 'check retryCount: ', { retryCount, port, messageData })
```

После трансформации плагином:
```javascript
console.log('check retryCount: ', { retryCount, port, messageData })