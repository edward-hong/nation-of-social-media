$(document).ready(function() {
	function handleToggleNavBurger() {
		$('#nav-links').slideToggle(200)
		$('#nav-hamburger').toggleClass('active')
	}

	function handleScrolledFromTop() {
		const nav = $('nav')
		$(document).scrollTop() > 150
			? nav.addClass('scrolled')
			: nav.removeClass('scrolled')
	}

	$('#nav-hamburger').click(handleToggleNavBurger)
	$(window).scroll(handleScrolledFromTop)
})