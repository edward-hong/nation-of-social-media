// handle switching of search type ================

function getSearchType(searchBar) {
  const initSearchType = 'youtube'
  return (
    searchBar.attr('placeholder').split(' ')[1].toLowerCase() || initSearchType
  )
}

function getPlaceholderFromSearchType(searchType) {
  return 'influencer ad space'
}

function handleSwitchSearchTypeGenerator(getPlaceholder) {
  return function handleSwitchSearchType(e) {
    const searchType = $(e.target).attr('id').substr(7)
    $('#search-bar').attr('placeholder', getPlaceholder(searchType))
    $('#search-bar').val('')
  }
}

//=================================================

// Search utility functions =======================

function getChannelDataFromSearchedResults(searchResults, username) {
  return searchResults.filter(
    ({ snippet: { channelTitle } }) =>
      channelTitle.toLowerCase() == username.toLowerCase()
  )[0]
}

function invalidUsernameMessage(platformAccount) {
  $('#search-message').fadeOut(500)
  setTimeout(() => {
    $('#search-message')
      .text(`Please enter a valid ${platformAccount}`)
      .fadeIn(500)
  }, 500)
}

function generateSearchMessageHtml(
  account,
  followerCount,
  followerText,
  numOfCountries
) {
  return `${
    followerText === 'Twitter followers' ? '@' : ''
  }${account} has ${followerCount} ${followerText}<br />That's more than the population of ${numOfCountries}!<br /><div class="tweet-container${
    followerText === 'Twitter followers' ? ' border' : ''
  }"><i class="tweet fa fa-twitter"></i><span>Tweet!</span></div>`
}

function generateTweetText(account, followerCount, followerText, numOfAreas) {
  return `${
    followerText === 'Twitter followers' ? '%40' : ''
  }${account} has ${followerCount} ${followerText}. That's more than the population of ${numOfAreas}! %23NationOfSocialMedia bitly.ws/DpdX`
}

function handleSearchResults(name, num, platform, countObj) {
  if (platform === 'Twitter followers') {
    name = adjustForAt(name)
  }
  const html = generateSearchMessageHtml(name, num, platform, countObj)

  const tweetText = generateTweetText(name, num, platform, countObj)

  renderAnimation(html, tweetText, renderText)
}

//=================================================

// Formatting search message ======================

function numberWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function adjustForAt(username) {
  return username.slice(0, 1) === '@' ? username.slice(1) : username
}

//=================================================

// Rendering ======================================

function renderText(html, tweetText) {
  $('#search-message').html(html).fadeIn(500)
  $('.tweet-container').mouseenter(() => $('.tweet-container').width(150))
  $('.tweet-container').mouseleave(() => $('.tweet-container').width(50))
  $('.tweet-container span').click(() => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`
    window.open(tweetUrl, 'twitter')
  })
}

function renderAnimation(html, tweetText, renderText) {
  $('#search-message').fadeOut(500)
  if (!$('#search-message').text()) {
    renderText(html, tweetText)
  } else {
    setTimeout(renderText.bind(null, html, tweetText), 500)
  }
}

//=================================================

// Handling of triggering of search ===============

function handleClickedSearch(startSearch) {
  return startSearch
}

function handleKeypressedSearch(startSearch) {
  return function handleKeypress(e) {
    if (e.which === 13) {
      startSearch()
    }
  }
}

//=================================================
