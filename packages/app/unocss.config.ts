import * as path from 'path'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
  ],
  shortcuts: {
    'flex-items-center': 'flex items-center',
    'border-base': 'border-gray-200 dark:border-dark-200',
    'bg-base': 'bg-white dark:bg-dark-100',
    'txt-color-base': 'text-gray-900 dark:text-gray-300',
    'txt-color-fade': 'text-gray-900:50 dark:text-gray-300:50',
    'editor-input-fastpath-option': 'flex items-center m0.5 py0.5 px1 cursor-pointer hover:bg-neutral-400/30',
    'editor-input-fastpath-icon': 'text-4 text-neutral-700/60 dark:text-neutral-100/60',
  },
  include: path.join(__dirname, 'src/**/*.{vue,ts}'),
})
