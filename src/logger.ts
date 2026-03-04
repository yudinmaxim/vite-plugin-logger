// Базовые интерфейсы
interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enabled: boolean;
  backgroundColor?: string; // Цвет фона для префикса пакета
}

type ConsoleLikeLogger = {
  [K in keyof Console]: Console[K];
} & {
  options: LoggerConfig & { name: string };
  setOptions: (newOptions: Partial<LoggerConfig>) => void;
};

const DEFAULT_CONFIG = {
  level: 'debug',
  enabled: true
}

// Универсальная функция для получения глобального объекта
const getGlobalObject = (): any => {
  if (typeof globalThis !== 'undefined') return globalThis
  if (typeof window !== 'undefined') return window
  if (typeof global !== 'undefined') return global
  if (typeof self !== 'undefined') return self
  return {}
}

const getConfig = (): LoggerConfig => {
  const globalObj = getGlobalObject()
  return globalObj?.zep?.loggerConfig ?? DEFAULT_CONFIG
}

const setConfig = (config: LoggerConfig) => {
  const globalObj = getGlobalObject()
  if (!globalObj?.zep) {
    globalObj.zep = {}
  }
  if (!globalObj?.zep.loggerConfig) {
    globalObj.zep.loggerConfig = config
  }

  globalObj.zep.loggerConfig = config
}

const patchConfig = (config: Partial<LoggerConfig>) => {
  const globalObj = getGlobalObject()
  if (!globalObj?.zep) {
    globalObj.zep = {}
  }
  if (!globalObj?.zep.loggerConfig) {
    globalObj.zep.loggerConfig = config
  }

  globalObj.zep.loggerConfig = { ...globalObj.zep.loggerConfig, ...config }
}

// Фабрика логгеров для конкретного пакета
const createLoggerProxy = (packageName: string, backgroundColor?: string): ConsoleLikeLogger => {
  const target = {
    _packageName: packageName,
    _backgroundColor: backgroundColor || '#d15c5cff' // Цвет по умолчанию
  }

  return new Proxy(target, {
    get(target, prop: string) {
      if (prop === 'options') {
        return {
          ...getConfig(), // Читаем напрямую из глобальной переменной
          name: target._packageName
        }
      }

      if (prop === 'setOptions') {
        return (newOptions: Partial<LoggerConfig>) => {
          patchConfig(newOptions)
        }
      }

      if (prop in console && typeof (console as any)[prop] === 'function') {
        // Создаем функцию каждый раз заново, чтобы всегда использовать актуальную глобальную конфигурацию
        return (...args: unknown[]) => {
          // console.log('logger config', { target, options: (window as any)?.globalLoggerConfig })
          try {
            if (!getConfig()?.enabled) return // Читаем напрямую из глобальной переменной

            const logLevels = {
              debug: [ 'debug', 'log', 'info', 'warn', 'error' ],
              info: [ 'log', 'info', 'warn', 'error' ],
              warn: [ 'warn', 'error' ],
              error: [ 'error' ]
            }

            const shouldLog = getConfig()
              ? logLevels[getConfig().level]?.includes(prop) ?? false
              : false
            if (!shouldLog) return

            // Определяем стиль для браузера или Node.js
            const isBrowser = typeof window !== 'undefined' && window === getGlobalObject()

            if (isBrowser) {
              // В браузере используем CSS стили с настраиваемым цветом фона
              const style = `background-color: ${target._backgroundColor}; border-radius: 2px; padding: 2px; color: white; font-weight: bold` // eslint-disable-line max-len
              const finalArgs = [ `%c[${target._packageName}]`, style, ...args ]
              ;(console as any)[prop](...finalArgs)
            } else {
              // В Node.js используем ANSI коды (пока оставляем фиксированный цвет)
              const packagePrefix = `\x1b[97;100m[${target._packageName}]\x1b[0m`
              const finalArgs = [ packagePrefix, ...args ]
              ;(console as any)[prop](...finalArgs)
            }
          } catch (error) {
            console.error('Logger error:', error)
          }
        }
      }

      return (target as any)[prop]
    }
  }) as unknown as ConsoleLikeLogger
}

// 🎯 ГЛАВНАЯ ФУНКЦИЯ-ФАБРИКА ЛОГГЕРОВ
// Вызывается как logger('packageName').info('message') или logger('packageName', '#ff0000').info('message')
const logger = (packageName: string, backgroundColor?: string): ConsoleLikeLogger => {
  return createLoggerProxy(packageName, backgroundColor)
}

// Регистрируем глобально для использования в браузере
const globalObj = getGlobalObject()
if (typeof globalObj !== 'undefined') {
  if (!globalObj?.zep) {
    globalObj.zep = {}
  }

  if (!globalObj?.zep?.logger) {
    globalObj.zep.logger = logger
  }

  if (!globalObj?.zep.loggerConfig) {
    globalObj.zep.loggerConfig = DEFAULT_CONFIG
  }
}

// Для Node.js окружения
if (typeof global !== 'undefined') {
  (global as any).logger = logger
}

// Экспортируем для использования в модулях
export { logger }

// Экспортируем утилиты для конфигурации
export const configureLogger = (config: Partial<LoggerConfig>): void => {
  const globalObj = getGlobalObject()
  globalObj.zep.loggerConfig = { ...(globalObj?.zep?.loggerConfig ?? {}), ...config }
}

export const createPackageLogger = (packageName: string): ConsoleLikeLogger => {
  return logger(packageName)
}

export type { LoggerConfig, ConsoleLikeLogger }