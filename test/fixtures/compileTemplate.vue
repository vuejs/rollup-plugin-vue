<template>
  <div>
    <p>{{msg}}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: 'Compile Template',
    };
  },
  computed: {
    exclamation() {
      return `${this.msg}!`;
    },
    uselessFatArrow: () => 0
  },
  fatArrowTest() {
    const a = [5, 7];
    a.map(v => this.msg);
  },
}
</script>
