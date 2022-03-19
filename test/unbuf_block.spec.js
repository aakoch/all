import { testString } from './fixture.js'

testString(`
-
  var list = ["Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis"]
each item in list
  li= item
  `, '<li>Uno</li><li>Dos</li><li>Tres</li><li>Cuatro</li><li>Cinco</li><li>Seis</li>')


{"source":"/Users/aakoch/projects/new-foo/workspaces/lexing-transformer/stdin","type":"unbuf_code_block","lineNumber": 1, "children":[
  {"source":"/Users/aakoch/projects/new-foo/workspaces/lexing-transformer/stdin","name":"var","type":"tag","val":"list = [\"Uno\", \"Dos\", \"Tres\", \"Cuatro\", \"Cinco\", \"Seis\"]","lineNumber": 2}]
},
{"source":"/Users/aakoch/projects/new-foo/workspaces/lexing-transformer/stdin","type":"each","val":"item in list","lineNumber": 3, "children":[
  {"source":"/Users/aakoch/projects/new-foo/workspaces/lexing-transformer/stdin","name":"li","type":"tag","assignment":true,"assignment_val":"item","lineNumber": 4