<template>
  <div ref="containerRef" class="flex flex-col h-full select-none">
    <div class="w-full overflow-auto relative" :style="{ height: topPercent }">
      <slot name="top" />
    </div>
    <div
      class="w-full"
      :style="dividerStyle"
      :class="dividerClass"
      @mouseenter="isHover = true"
      @mouseleave="isHover = false"
      @mousedown="onMouseDown"
    />
    <div class="flex-1 w-full overflow-auto relative">
      <slot name="bottom" />
    </div>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<number>({ default: 0 })
const props = defineProps<{ dividerHeight?: number }>()
const dividerH = computed(() => props.dividerHeight ?? 6)
const containerRef = ref<HTMLElement | null>(null)
const isHover = ref(false)
const isDragging = ref(false)
const startY = ref(0)
const startTop = ref(0)
const containerHeight = ref(0)

const topPercent = computed(() => {
  if (containerHeight.value === 0) return '0%'
  return `${((containerHeight.value - dividerH.value - model.value) / containerHeight.value) * 100}%`
})
const dividerStyle = computed(() => ({
  height: `${dividerH.value}px`,
  cursor: 'row-resize',
  transition: 'background-color 200ms ease-out',
  backgroundColor: (isHover.value || isDragging.value)
    ? '#72ABD9'
    : 'var(--td-border-level-2-color)'
}))
const dividerClass = computed(() => [])

function clamp() {
  // 限制 bottom 高度在合理范围内
  if (model.value > containerHeight.value - dividerH.value) 
    model.value = containerHeight.value - dividerH.value
  if (model.value < 0) model.value = 0
}

function updateContainerHeight() {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
    // clamp()
  }
}

let ro: ResizeObserver | null = null

onMounted(() => {
  updateContainerHeight()
  if (containerRef.value) {
    ro = new ResizeObserver(() => updateContainerHeight())
    ro.observe(containerRef.value)
  }
  window.addEventListener('resize', updateContainerHeight)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  window.removeEventListener('resize', updateContainerHeight)
  detachListeners()
})

function onMouseDown(e: MouseEvent) {
  isDragging.value = true
  startY.value = e.clientY
  startTop.value = model.value
  attachListeners()
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value || containerHeight.value === 0) return
  const delta = e.clientY - startY.value
  model.value = startTop.value - delta  // 向上拖动增加bottom高度，向下拖动减少
  clamp()
}

function onMouseUp() {
  if (!isDragging.value) return
  isDragging.value = false
  detachListeners()
}

function attachListeners() {
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function detachListeners() {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}
</script>