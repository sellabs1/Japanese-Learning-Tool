$(document).ready(function(){
	$(".level-list button, .mobile-nav li").click(function(){
		var page = $(this).attr('id');
		var currentInfo = $('.about-content');

		$.get('pages/' + page + '.html', function(data){
			var info = data;
			currentInfo.empty();
			currentInfo.append(info).hide().fadeIn();
		});
	});

	$(".header").on("click", ".mobile-nav", function(e){
		e.stopPropagation();
		$(this).find("ul").slideToggle();
	});

	$(".header").click(function(){
		window.location = "index.html";
	});
});