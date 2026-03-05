import { logger } from 'vite-plugin-logger/logger'

const log = logger('demo-vue', '#42b883')

log.info('Logger bundle loaded!')
log.warn('This is a warning from logger bundle')
log.error('This is an error from logger bundle')
