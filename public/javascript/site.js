window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments)};
gtag('js', new Date());
gtag('config', 'UA-105731105-1');

(function($) {

  $(function() {
    $('.button-collapse').sideNav();
    $('.parallax').parallax();
  });

  $('#btn_porque_utilizar').click(function(){
    $('html, body').animate({scrollTop: $('#porque_utilizar').offset().top}, 800);
  });

  $('#btn_proximos_passos').click(function(){
    $('html, body').animate({scrollTop: $('#proximos_passos').offset().top}, 1500);
  });

  $('#btn_apoie_o_projeto').click(function(){
    $('html, body').animate({scrollTop: $('#apoie_o_projeto').offset().top}, 2000);
  });

})(jQuery);
