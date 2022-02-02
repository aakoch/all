import { testString } from './fixture.js'

testString('p test', '<p>test</p>')
testString('p.class test', '<p class="class">test</p>')
testString('p.class(src="test.html") test', '<p class="class" src="test.html">test</p>')
testString(`html
  head
  body
    p This is a sentence`, '<html><head></head><body><p>This is a sentence</p></body></html>')
testString(`mixin test()
  p Inside mixin
+test`, '<p>Inside mixin</p>')
