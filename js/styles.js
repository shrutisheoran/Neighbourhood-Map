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
	$('.ui.menu').hide();
	$('.ui.dropdown').dropdown();
}
f();