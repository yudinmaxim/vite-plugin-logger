import type { PluginOption } from 'vite'
import { dirname, join } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'

/**
 * Опции плагина логгера для Vite.
 */
export interface LoggerPluginOptions {
  /** Название пакета, которое будет отображаться в логах. */
  packageName: string;
  /** Цвет фона для логов (например, '#ff0000'). */
  color?: string;
  /** Паттерны имён файлов, которые следует исключить из обработки. */
  exclude?: string[];
}

/**
 * Создаёт плагин Vite для логгирования с указанным именем пакета и цветом фона.
 * @param packageName - Название пакета, которое будет отображаться в логах.
 * @param backgroundColor - Цвет фона для логов (например, '#ff0000').
 * @returns Плагин Vite.
 */
export default function loggerPlugin(packageName: string, backgroundColor?: string): PluginOption
/**
 * Создаёт плагин Vite для логгирования с использованием объекта опций.
 * @param options - Опции плагина логгера.
 * @returns Плагин Vite.
 */
export default function loggerPlugin(options: LoggerPluginOptions): PluginOption
/**
 * Основная реализация плагина логгера для Vite.
 * @param packageNameOrOptions - Либо строка с именем пакета, либо объект опций.
 * @param backgroundColor - Цвет фона для логов (если передан строковый параметр).
 * @returns Плагин Vite, который трансформирует вызовы console.* для добавления меток.
 */
export default function loggerPlugin(
  packageNameOrOptions: string | LoggerPluginOptions,
  backgroundColor?: string
): PluginOption {
  let packageName: string
  let color: string | undefined
  let excludePatterns: string[] | undefined

  if (typeof packageNameOrOptions === 'string') {
    packageName = packageNameOrOptions
    color = backgroundColor
    excludePatterns = undefined
  } else {
    packageName = packageNameOrOptions.packageName
    color = packageNameOrOptions.color
    excludePatterns = packageNameOrOptions.exclude
  }

  return {
    name: 'vite-plugin-logger',
    enforce: 'post' as const,

    async transform(code: string, id: string) {
      const fileName = id.split('/').pop() || ''
      
      if (id.includes('node_modules') || !/\.(js|ts|jsx|tsx|vue)$/.test(id)) {
        return null
      }

      // Пропускаем файлы логгера
      if (fileName.includes('logger') || fileName.includes('vite-plugin-logger')) {
        return null
      }

      // Проверяем зависимость в package.json
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
        if (!('vite-plugin-logger' in deps)) {
          return null
        }
      } catch {
        return null
      }

      if (excludePatterns && excludePatterns.length > 0) {
        for (const pattern of excludePatterns) {
          const regexPattern = pattern.replace(/\*/g, '.*')
          const regex = new RegExp(`^${regexPattern}$`)
          if (regex.test(fileName)) {
            return null
          }
        }
      }

      let transformedCode = code
      let hasChanges = false

      const consoleMethods = [
        'log', 'info', 'warn', 'error', 'debug', 'trace', 'dir', 'dirxml', 'table',
        'group', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'timeLog',
        'count', 'countReset', 'assert', 'clear', 'profile', 'profileEnd'
      ]
      const consoleMethodsPattern = consoleMethods.join('|')

      // Исключение @logger-exclude
      const excludeConsoleRegex = new RegExp(
        `\\bconsole\\.(${consoleMethodsPattern})\\(\\s*["']@logger-exclude["']\\s*,?\\s*`,
        'g'
      )

      transformedCode = transformedCode.replace(excludeConsoleRegex, (match, method) => {
        hasChanges = true
        return `console.${method}(`
      })

      // Обычные console вызовы
      const normalConsoleRegex = new RegExp(
        `\\bconsole\\.(${consoleMethodsPattern})\\(`,
        'g'
      )

      transformedCode = transformedCode.replace(normalConsoleRegex, (match, method) => {
        hasChanges = true
        const colorArg = color ? `'${color}'` : ''
        return `__$vl$__.logger('${packageName}', ${colorArg}).${method}(`
      })

      if (hasChanges) {
        const loggerImport = `import * as __$vl$__ from 'vite-plugin-logger/logger';`

        if (!transformedCode.includes('import * as __$vl$__')) {
          transformedCode = loggerImport + '\n' + transformedCode
        }
      }

      return {
        code: transformedCode,
        map: null
      }
    }
  } satisfies PluginOption
}