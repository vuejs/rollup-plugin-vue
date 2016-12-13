var compileTemplate = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._c;return _c('div',[_c('p',[_vm._v(_vm._s(_vm.msg))])])},staticRenderFns: [],
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
