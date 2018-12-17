!function(name,path,ctx){
  var latest,prev=name!=='Keen'&&window.Keen?window.Keen:false;ctx[name]=ctx[name]||{ready:function(fn){var h=document.getElementsByTagName('head')[0],s=document.createElement('script'),w=window,loaded;s.onload=s.onerror=s.onreadystatechange=function(){if((s.readyState&&!(/^c|loade/.test(s.readyState)))||loaded){return}s.onload=s.onreadystatechange=null;loaded=1;latest=w.Keen;if(prev){w.Keen=prev}else{try{delete w.Keen}catch(e){w.Keen=void 0}}ctx[name]=latest;ctx[name].ready(fn)};s.async=1;s.src=path;h.parentNode.insertBefore(s,h)}}
}('KeenAsync','https://d26b395fwzu5fz.cloudfront.net/keen-tracking-1.1.3.min.js',this);

KeenAsync.ready(function(){
  // Configure a client instance
  var client = new KeenAsync({
    projectId: '5968fbd8c9e77c000187796e',
    writeKey: '92006BEECFC397690ADDA1BFF0ADD1048674871C9C97ACEB0415FE964BBC4FD0CB8BDF0F918D7A1C4EEE65DC895EA8D45C7EC327A53593C6C605E6558020DD172E653908AE94D594432735F06713413B601C8E5A168094127913B352264A1455'
  });

  // Record an event
  client.recordEvent('pageviews', {
    title: document.title
  });
});
