<template>
  <h1 id="test" style="color: red;">Hello {{ name }}!</h1>
</template>

<script>
export default {
  data () {
    return { name: 'John Doe' }
  }
}
</script>

<documentation lang="md">
# Component

## Data

- **name** - Name of a person.
</documentation>
