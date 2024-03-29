<script lang="ts" setup>
import {
  EditorFloatMenuAction,
  FloatMenuShowTimingGap,
  FloatMenuZIndex,
} from '../../constants/editor'
import { editorEventBus } from '../../eventBus'

const editorCore = useEditorCoreInject()
const editorStore = useEditorStore()
const { selection, rects, text } = useTextSelection()
const floatMenuRef = ref<HTMLElement>()

const onHyperlinkBtnClick = () => {
  const left = rects.value[0]!.left
  const top = rects.value[0]!.top
  editorStore
    .setFloatMenuPosition({ left, top }, EditorFloatMenuAction.BySelection)
    .setLinkEditText(text.value)
    .setShowLinkEdit(true)
    .setShowEditorMenu(false)
}
const openEditorMenu = useDebounceFn((pos: { left: number; top: number }) => {
  editorStore.setFloatMenuPosition(pos, EditorFloatMenuAction.BySelection)
  nextTick(() => {
    editorStore.setShowLinkEdit(false).setShowEditorMenu(true)
  })
}, FloatMenuShowTimingGap)

editorEventBus.on('editorMounted', ({ core }) => {
  core.on('selectionChange', ({ tr }) => {
    if (tr.getMeta('dragging')) {
      return // skip showing float menu on dragging
    }

    const nothingSelected = selection.value?.isCollapsed
    if (nothingSelected) {
      editorStore.isShowEditorMenu && editorStore.setShowEditorMenu(false)
    } else if (editorCore?.value.activeManager.isMenuAvailable()) {
      openEditorMenu({
        left: rects.value[0]!.left,
        top: rects.value[0]!.top,
      })
    }
  })
})

useEventListener(document, 'click', (event) => {
  // if click outside of editor, hide float menu
  if (!editorStore.isShowEditorMenu) {
    return
  }
  const editorDOM = editorCore?.value.view.dom
  if (!editorDOM) {
    return
  }
  const isClickInsideEditor = editorDOM.contains(event.target as Node)
  const isClickInsideFloatMenu = floatMenuRef.value?.contains(
    event.target as Node
  )
  if (!isClickInsideEditor && !isClickInsideFloatMenu) {
    editorStore.setShowEditorMenu(false)
  }
})
</script>

<template>
  <teleport to="body">
    <transition name="float-slide-fade">
      <div
        v-show="editorStore.isShowEditorMenu"
        ref="floatMenuRef"
        class="hetero-editor__float-menu"
        :style="{
          position: 'absolute',
          left: `${editorStore.floatTargetNodeLeft}px`,
          top: `${editorStore.popoverTop}px`,
          zIndex: FloatMenuZIndex,
        }"
        flex-items-center
        justify-center
        py1
        px2
        border-base
        bg-base
        border-round
        editor-float-card
      >
        <HdEditorHeadingsSubMenu />
        <n-divider vertical />
        <HdEditorMenuBasics />
        <n-divider vertical />
        <HdEditorMenuTextAlign />
        <n-divider vertical />
        <n-button
          class="hetero-editor__float-menu-item hyperlink"
          quaternary
          px1
          mx1
          :disabled="!editorStore.menuAvailableState.hyperlink"
          @click="onHyperlinkBtnClick"
        >
          <template #icon>
            <n-icon><div i-ic:round-link mr1 /></n-icon>
          </template>
        </n-button>
      </div>
    </transition>
  </teleport>
</template>

<style lang="less">
@import '../../styles/utils.less';

.hetero-editor__float-menu-item {
  .active-text-btn;
}
</style>
