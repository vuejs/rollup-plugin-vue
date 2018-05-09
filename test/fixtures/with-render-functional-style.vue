<script>
export default {
  functional: true,
  render(h) {
    return h(
      'div',
      { class: 'foo', attrs: { id: 'test', style: 'color: red;' } },
      ['Hello functional']
    )
  }
}
</script>
