var compileTemplate = {render: function(){var _vm=this;return _vm._h('div',[_vm._h('p',[_vm._s(_vm.msg)])])},staticRenderFns: [],
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
};

export default compileTemplate;
