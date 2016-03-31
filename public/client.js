$(document).ready(function () {

  if ("WebSocket" in window) {
    alert("WebSocket is supported by your Browser!");

    // Let us open a web socket
    var ws = new WebSocket("ws://192.168.1.187:8080/echo");

    ws.onopen = function () {
      // Web Socket is connected, send data using send()
      $('#status').text('connected');
    };

    ws.onmessage = function (evt) {
      var received_msg = evt.data;
      $('#validate').text(received_msg);
    };

    ws.onclose = function () {
      // websocket is closed.
      $('#status').text('closed');
    };
  } else {
    // The browser doesn't support WebSocket
    alert("WebSocket NOT supported by your Browser!");
  }
})
