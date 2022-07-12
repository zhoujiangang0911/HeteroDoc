<script lang="ts" setup>
import type { EditorCore } from '@hetero/editor'
import { useHeteroEditor } from '../../composables/useHeteroEditor'

const naiveUITheme = useNaiveThemeSetup()
const envStore = useEnvStore()
const themeModeText = useThemeModeText()
const editorRef = templateRef<HTMLElement | null>('editor')
const editorCore = ref<EditorCore>()

onMounted(() => {
  const editorMountPoint = editorRef.value
  if (editorMountPoint) {
    editorCore.value = useHeteroEditor({
      container: editorMountPoint,
      isReadOnly: false,
      autofocus: true,
    }, {
      fromKeys: ['bold', 'italic', 'code', 'underline'],
    })
  }
})
</script>

<template>
  <n-config-provider :theme="naiveUITheme">
    <div
      class="page-misc__editor-test"
      bg-base flex-col items-center justify-center
      w100vw min-h-100vh p-y-10
    >
      <div
        class="page-misc__editor-test__settings"
        flex-items-center justify-center m-y-4
      >
        <n-button m-x-4 @click="envStore.toggleDark()">
          <div v-if="envStore.isDark" i-carbon-moon text-6 mr2 font-light />
          <div v-else i-carbon-light text-6 mr2 font-light />
          <span>{{ themeModeText }}</span>
        </n-button>
        <n-button class="editor-toolbar-item bold" quaternary p-x-1 @click="editorCore?.cmdManager.chain.focus().toggleBold().run()">
          <template #icon>
            <n-icon><div i-ic:round-format-bold mr1 /></n-icon>
          </template>
        </n-button>
        <n-button class="editor-toolbar-item italic" quaternary p-x-1 @click="editorCore?.cmdManager.chain.focus().toggleItalic().run()">
          <template #icon>
            <n-icon><div i-ic:round-format-italic mr1 /></n-icon>
          </template>
        </n-button>
        <n-button class="editor-toolbar-item code" quaternary p-x-1 @click="editorCore?.cmdManager.chain.focus().toggleCode().run()">
          <template #icon>
            <n-icon><div i-ic:round-code mr1 /></n-icon>
          </template>
        </n-button>
        <n-button class="editor-toolbar-item underline" quaternary p-x-1 @click="editorCore?.cmdManager.chain.focus().toggleUnderline().run()">
          <template #icon>
            <n-icon><div i-ic:round-format-underlined mr1 /></n-icon>
          </template>
        </n-button>
      </div>
      <div
        class="page-misc__editor-test-container"
        w80vw m-x-auto
        border-base border-rounded
      >
        <div
          ref="editor"
          class="page-misc__editor-test-mount-point"
          p-12 bg="neutral-200/50 dark:neutral-600/70"
        />
      </div>
    </div>
  </n-config-provider>
</template>

<style lang="less">
:root {
  --heterodoc-editor-color: rgba(0,0,0,0.85);
  --heterodoc-caret-color: rgba(0,0,0,0.85);
  --heterodoc-inline-code-color: #4a84d3;
  --heterodoc-inline-code-bg-color: rgba(138, 152, 158, 0.2);
}
:root.dark {
  --heterodoc-editor-color: rgba(255,255,255,0.85);
  --heterodoc-caret-color: rgba(255,255,255,0.85);
  --heterodoc-inline-code-color: #b4d4ff;
  --heterodoc-inline-code-bg-color: rgba(245, 245, 245, 0.2);
}

.ProseMirror {
  min-height: 600px;
  outline: none;
  @media screen and (max-width: 768px) {
    min-height: 300px;
  }

  color: var(--heterodoc-editor-color);
  caret-color: var(--heterodoc-caret-color);

  code {
    margin: 0 2px;
    padding: 2px 0.4em;
    font-size: 95%;
    border-radius: 6px;
    color: var(--heterodoc-inline-code-color);
    background-color: var(--heterodoc-inline-code-bg-color);
  }
}
</style>