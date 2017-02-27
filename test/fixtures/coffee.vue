<template>
<h1 :id="id" @click="hi">hello</h1>
<input type="text">
</template>

<script lang="coffee">
component = data: () -> [2, 4, 6, 8]
export default component
</script>
