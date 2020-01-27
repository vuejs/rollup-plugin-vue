<script>
import { h } from 'vue'
import HelloWorld from './HelloWorld.vue'

export default {
  name: 'App',
  setup() {
    return () => h(HelloWorld, { name: 'World' })
  },
}
</script>
