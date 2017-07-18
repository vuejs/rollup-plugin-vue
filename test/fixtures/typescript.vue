<template>
	<h1 :id="id" @click="hi">
		hello</h1>
	<input type="text">
</template>

<script lang="ts">
import Vue from 'vue'
interface Data {
	hello: string
}
const component = {
	data: () => ({
		hello: 'world!'
	}),
	methods: {
		hello() {
			return this.hello
		}
	}
} as Vue.ComponentOptions<Data & Vue>

export default component
</script>
