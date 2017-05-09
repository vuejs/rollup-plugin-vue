<template>
  <div>
    <Msg></Msg>
  </div>
</template>

<script>
export default {
  components: {
    Msg: {
      render: h => h('div', ['Hello']),
    },
  },
}
</script>
