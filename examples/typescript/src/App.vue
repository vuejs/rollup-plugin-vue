<template>
  Foo {{ title }}
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface ComponentData {
  title: string
}

export default defineComponent({
  name: 'App',
  data(): ComponentData {
    return {
      title: 'Bar',
    }
  }
})
</script>
