$(document).ready(function () {
  const wrapper = $('#wrapper')
  const topLayer = $('.top')
  const handle = $('.handle')
  const skew = 1000
  const initialDelta = 0

  const handleSlider = handleSliderGenerator(
    wrapper,
    topLayer,
    handleMouseMoveGenerator(initialDelta, handle, topLayer, skew),
  )

  function handleMouseMoveGenerator(initialDelta, handle, topLayer, skew) {
    return function handleMouseMove(e) {
      const delta = initialDelta + (e.clientX - window.innerWidth / 2) * 0.5
      handle.css('left', `${e.clientX + delta}px`)
      topLayer.css('width', `${e.clientX + skew + delta}px`)
    }
  }

  function handleSliderGenerator(wrapper, topLayer, handleMouseMove) {
    return function handleSlider() {
      if ($(document).width() > 800) {
        wrapper.addClass('skewed')
        wrapper.mousemove(handleMouseMove)
      } else {
        wrapper.removeClass('skewed')
        wrapper.unbind()
        topLayer.css('width', 'calc(50vw + 1000px)')
      }
    }
  }

  handleSlider()
  $(window).resize(handleSlider)
})
