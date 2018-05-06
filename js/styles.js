$('.fa-bars').click(function() {
	$('.ui.menu').toggle();
});
$('.search-loc').click(function() {
	$('.cookie.nag').toggle();
});
$('.close').click(function() {
	$('.cookie.nag').hide();
});

function f() {
	$('.rating').rating('disable');
	$('.ui.menu').hide();
	$('.ui.dropdown').dropdown();
}
f();