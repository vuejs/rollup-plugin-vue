<template functional>
  <div>
    <h2 id="test" style="color: red">Hello! {{ props.msg }}</h2>
    <slot></slot> <slot name="slot2"></slot>
    <slot :msg="props.msg" name="scoped"></slot>
    <div>Some <span>text</span></div>
    <div v-if="false">Not exist</div>
    <div class="clickable" @click="parent.fn"></div>
  </div>
</template>

<script>
export default {
  props: {
    msg: {
      type: String,
      default: 'hello'
    }
  }
}
</script>
