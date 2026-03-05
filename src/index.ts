import type { Plugin } from 'vite'
import { dirname, join } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'

interface LoggerPluginOptions {
  /** Имя пакета для логирования */
  packageName: string;
  /** Цвет фона для префикса (опционально, по умолчанию '#d15c5cff') */
  color?: string;
  /** Флаг для локальной обработки пакета (опционально, по умолчанию false) */
  isLocal?: boolean;
  /** Массив паттернов файлов для игнорирования (опционально) */
  exclude?: string[];
}

/**
 * Vite плагин для автоматической замены console на logger('packageName', backgroundColor)
 *
 * @param packageName - Имя пакета для логирования
 * @param backgroundColor - Цвет фона для префикса (опционально, по умолчанию '#d15c5cff')
 * @param isLocal - Флаг для локальной обработки пакета (опционально, по умолчанию false)
 * @returns Vite плагин
 *
 * @example
 * // vite.config.ts
 * import loggerPlugin from '@zephyr/vite-plugin-logger'
 *
 * export default {
 *   plugins: [
 *     // Старый формат с тремя аргументами
 *     loggerPlugin('my-package', '#ff0000'), // Красный цвет
 *     loggerPlugin('another-package', '#00ff00'), // Зеленый цвет
 *     loggerPlugin('default-package'), // Цвет по умолчанию (#d15c5cff)
 *     loggerPlugin('local-package', '#0000ff', true), // Локальный пакет, синий цвет
 *
 *     // Новый формат с объектом конфигурации
 *     loggerPlugin({
 *       packageName: 'my-package',
 *       color: '#ff0000',
 *       exclude: ['api.worker*']
 *     })
 *   ]
 * }
 *
 * // В коде пакетов:
 * console.log('Hello') // -> logger('my-package', '#ff0000').log('Hello')
 * console.warn('Warning') // -> logger('my-package', '#ff0000').warn('Warning')
 *
 * // Исключение из трансформации:
 * console.log("@logger-exclude", 'This stays as console.log') // -> console.log('This stays as console.log')
 */

/**
 * Примечание: Node-модули ('node:path', 'node:fs') импортируются статически,
 * так как этот плагин предназначен для работы в Node.js окружении при сборке.
 */
export default function loggerPlugin(packageName: string, backgroundColor?: string, isLocal?: boolean): Plugin
export default function loggerPlugin(options: LoggerPluginOptions): Plugin
export default function loggerPlugin(
  packageNameOrOptions: string | LoggerPluginOptions,
  backgroundColor?: string,
  isLocal: boolean = false
): Plugin {
  // Обрабатываем оба формата вызова
  let packageName: string
  let color: string | undefined
  let local: boolean
  let excludePatterns: string[] | undefined

  if (typeof packageNameOrOptions === 'string') {
    // Старый формат с тремя аргументами
    packageName = packageNameOrOptions
    color = backgroundColor
    local = isLocal
    excludePatterns = undefined
  } else {
    // Новый формат с объектом конфигурации
    packageName = packageNameOrOptions.packageName
    color = packageNameOrOptions.color
    local = packageNameOrOptions.isLocal ?? false
    excludePatterns = packageNameOrOptions.exclude
  }
  return {
    name: 'vite-plugin-logger',
    enforce: 'pre',

    async transform(code: string, id: string) {
      // Пропускаем node_modules и не-JS/TS файлы
      if (id.includes('node_modules') || !/\.(js|ts|jsx|tsx|vue)$/.test(id)) {
        return null
      }

      // Пропускаем сам файл логгера, чтобы избежать рекурсии
      const isLoggerFile = id.endsWith('logger.ts') || id.endsWith('vite-plugin-logger')
      if (isLoggerFile) {
        return null
      }

      // Проверяем, есть ли зависимость на логгер в package.json пакета (если не локальный режим)
      if (!local) {
        try {
          let dir = dirname(id)
          let pkgPath: string | null = null
          while (dir !== dirname(dir)) {
            const candidate = join(dir, 'package.json')
            if (existsSync(candidate)) {
              pkgPath = candidate
              break
            }
            dir = dirname(dir)
          }
          if (!pkgPath) {
            return null
          }

          const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf-8'))
          const deps = { ...(pkgJson.dependencies || {}), ...(pkgJson.devDependencies || {}) }
          // if (!('@zephyr/use-tools' in deps)) {
          //   return null
          // }
        } catch {
          return null
        }
      }

      // Проверяем, соответствует ли файл какому-либо из паттернов исключения
      if (excludePatterns && excludePatterns.length > 0) {
        const fileName = id.split('/').pop() || ''
        for (const pattern of excludePatterns) {
          // Преобразуем паттерн в регулярное выражение (поддерживаем * как wildcard)
          const regexPattern = pattern.replace(/\*/g, '.*')
          const regex = new RegExp(`^${regexPattern}$`)
          if (regex.test(fileName)) {
            // console.log('Exclude-file', fileName)
            // Файл соответствует паттерну исключения - пропускаем его
            return null
          } else {
            // console.log('Not exclude', fileName)
          }
        }
      }

      let transformedCode = code
      let hasChanges = false

      // Определяем локальный идентификатор логгера (будет использован при замене console.*)
      // Всегда используем __$vl$__ и всегда добавляем импорт для избежания конфликтов
      const ensureLocalLoggerId = (): { id: string; withImport: boolean } => {
        return { id: '__$vl$__', withImport: true }
      }

      // Обрабатываем console вызовы
      // Сначала ищем вызовы с маркером @logger-exclude в аргументах
      const consoleMethods = [
        'log', 'info', 'warn', 'error', 'debug', 'trace', 'dir', 'dirxml', 'table',
        'group', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'timeLog',
        'count', 'countReset', 'assert', 'clear', 'profile', 'profileEnd'
      ]
      const consoleMethodsPattern = consoleMethods.join('|')
      const excludeConsoleRegex = new RegExp(
        `\\bconsole\\.(${consoleMethodsPattern})\\(\\s*["']@logger-exclude["']\\s*,?\\s*`,
        'g'
      )

      transformedCode = transformedCode.replace(excludeConsoleRegex, (match, method) => {
        // console.log('Find EXCLUDE', { match, method })
        // Заменяем на console.method(, убирая маркер
        hasChanges = true
        return `console.${method}(`
      })

      // Затем обрабатываем все остальные console вызовы (которые не содержат @logger-exclude)
      const normalConsoleRegex = new RegExp(
        `\\bconsole\\.(${consoleMethodsPattern})\\(`,
        'g'
      )

      const { id: localLoggerId, withImport } = ensureLocalLoggerId()

      transformedCode = transformedCode.replace(normalConsoleRegex, (match, method) => {
        hasChanges = true
        const colorArg = color ? `'${color}'` : ''
        return `${localLoggerId}('${packageName}', ${colorArg}).${method}(`
      })

      // Если были изменения, добавляем импорт logger при необходимости
      if (hasChanges) {
        if (withImport) {
          const modulePath = 'vite-plugin-logger/logger'
          const loggerImport = `import { logger as __$vl$__ } from '${modulePath}';`

          // Проверим, что такого импорта еще нет
          if (!transformedCode.includes(`import { logger as __$vl$__ } from '${modulePath}';`)) {
            // Добавляем импорт в самом верху файла
            transformedCode = loggerImport + '\n' + transformedCode
          }
        }

        return {
          code: transformedCode,
          map: null
        }
      }

      return null
    }
  }
}