$(document).ready(function () {

  if ("WebSocket" in window) {

    // Let us open a web socket
    var ws = new WebSocket(`ws://${window.location.host}/echo`);

    ws.onopen = function () {
      // Web Socket is connected, send data using send()
      $('#status').text('connected');
    };

    ws.onmessage = function (evt) {
      var received_msg = evt.data;
      $('#validate').text(evt.data);

      document.getElementById('beer').play();
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
