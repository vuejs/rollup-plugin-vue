(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=".baz { color: #008000; } .bar { color: blue } .foo { color: red; } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();




var noCssExtract = { template: "<div class=\"foo bar\">test</div>",};

export default noCssExtract;