/* Declare your variables here */

var this_can_be_really_long;
var j, k;

/* Write your code here */

c.width = innerWidth
c.height = innerHeight
this_can_be_really_long = 'hello world'

setInterval(function() {
  k = +new Date / 1000
  a.clearRect(0, 0, c.width, c.height)
  for (j=10;j--;)
    a.fillText(this_can_be_really_long,
      10 + Math.sin(k + j) * 5, 10 * j)
}, 50)