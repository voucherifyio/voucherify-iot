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

      const voucher = JSON.parse(evt.data)

      if (voucher.code) {
        document.getElementById('beer').play();
        $('.shape')
          .shape('set next side', '.beer.side')
          .shape('flip right');
        $('#code-value').text(voucher.code);

        setTimeout(function () {
          $('.shape')
            .shape('set next side', '.question.side')
            .shape('flip right');
        }, 3000)
      } else {
        document.getElementById('sad').play();
        $('.shape')
          .shape('set next side', '.sad.side')
          .shape('flip left');

        $('#code-value').text('');
        setTimeout(function () {
          $('.shape')
            .shape('set next side', '.question.side')
            .shape('flip right');
        }, 3000)

      }
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
