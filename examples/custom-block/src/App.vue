<script>
export default {
  name: 'App',
}
</script>

<template>
  <h1>{{ $t('say.hello', { name: 'Rahul' }) }}</h1>
</template>

<i18n lang="json">
{
  "say": {
    "hello": "Hello :name"
  }
}
</i18n>
