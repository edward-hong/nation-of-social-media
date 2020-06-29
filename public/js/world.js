$(document).ready(function () {
  // initial map load
  $('#world-map').vectorMap({ map: 'world_mill', backgroundColor: '#191919' })

  function plurality(num) {
    return num === 1 ? `1 country` : `${num} different countries`
  }

  function renderMap(followers, color) {
    const worldPopKeys = Object.keys(worldPop)
    const condObj = worldPopKeys.reduce(function assignConditions(acc, curr) {
      if (followers > worldPop[curr]) {
        acc[curr] = 2
      } else {
        acc[curr] = 1
      }
      return acc
    }, {})

    const num = Object.values(condObj).filter(function findValidCountries(
      criteria,
    ) {
      return criteria === 2
    }).length

    $('#world-map').empty()
    $('.jvectormap-tip').remove()
    $('#world-map').vectorMap({
      map: 'world_mill',
      backgroundColor: '#191919',
      series: {
        regions: [
          {
            values: condObj,
            scale: { '1': '#fff', '2': color },
            attribute: 'fill',
          },
        ],
      },
      onRegionTipShow: (e, el, code) => {
        el.html(
          `${el.html()} (Population - ${numberWithCommas(worldPop[code])})`,
        )
      },
    })
    return num
  }

  function handleSearchGenerator(
    getSearchType,
    getChannelDataFromSearchedResults,
    invalidUsernameMessage,
    plurality,
    numberWithCommas,
    renderMap,
  ) {
    return function handleSearch() {
      const searchType = getSearchType($('#search-bar'))
      const username = $('#search-bar').val()

      if (username) {
        switch (searchType) {
          case 'youtube':
            // get key from server
            $.getJSON('/api/youtube/key')
              .fail(function failedGettingYtKey(err) {
                console.error(`Failed to fetch Youtube key`, err)
              })
              // pass key and search promise
              .then(function gottenYtKey({ key }) {
                const searchYtFromUsernameUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=5&q=${username}&key=${key}`

                return [$.getJSON(searchYtFromUsernameUrl), key]
              })
              .fail(function failedSearchingUsername(err) {
                console.error(`Failed to search Youtube for username`, err)
              })
              // search for channel from username
              .then(function searchUsername([searchYtPromise, key]) {
                return searchYtPromise.then(function searchedUsername({
                  items,
                }) {
                  const channel = getChannelDataFromSearchedResults(
                    items,
                    username,
                  )
                  // if found channel, search channel for stats
                  if (channel) {
                    const { channelId, channelTitle } = channel.snippet
                    const searchChannelStatsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&key=${key}&id=${channelId}&part=id`
                    return [$.getJSON(searchChannelStatsUrl), channelTitle]
                  } else {
                    invalidUsernameMessage('Youtube username')
                    return Promise.reject()
                  }
                })
              })
              // Render map from stats and show search results to user
              .then(function passArgumentsFromPrevThenBlock([
                searchChannelPromise,
                channelTitle,
              ]) {
                searchChannelPromise.then(function gottenChannelStats({
                  items,
                }) {
                  const subscribers = items[0].statistics.subscriberCount
                  const numOfCountries = renderMap(subscribers, '#f00')

                  handleSearchResults(
                    channelTitle,
                    numberWithCommas(subscribers),
                    'Youtube Subscribers',
                    plurality(numOfCountries),
                  )
                })
              })
            break
          case 'twitter':
            const getTwitterAccountStatsUrl = `/api/twitter/${username}`
            $.getJSON(getTwitterAccountStatsUrl)
              .fail(function failedGettingTwitterStats(err) {
                console.error(`Failed to fetch Twitter stats`, err)
              })
              .then(({ followers }) => {
                if (followers) {
                  const numOfCountries = renderMap(followers, '#009cfa')

                  handleSearchResults(
                    username,
                    numberWithCommas(followers),
                    'Twitter followers',
                    plurality(numOfCountries),
                  )
                } else {
                  invalidUsernameMessage('Twitter handle')
                }
              })
            break
          case 'instagram':
            const searchInstagramUrl = `/api/instagram/${username}`
            $.getJSON(searchInstagramUrl).then(({ followers }) => {
              if (followers.length !== 0) {
                const numOfCountries = renderMap(followers, '#7031d1')

                handleSearchResults(
                  username,
                  numberWithCommas(followers),
                  'Instagram followers',
                  plurality(numOfCountries),
                )
              } else {
                invalidUsernameMessage('Instagram handle')
              }
            })
            break
        }
      }
    }
  }

  $('.search-type-icon').click(
    handleSwitchSearchTypeGenerator(getPlaceholderFromSearchType),
  )

  const handleSearchConsolidator = handleSearchGenerator(
    getSearchType,
    getChannelDataFromSearchedResults,
    invalidUsernameMessage,
    plurality,
    numberWithCommas,
    renderMap,
  )

  $('#search-icon').click(handleClickedSearch(handleSearchConsolidator))
  $('#search-bar').keypress(handleKeypressedSearch(handleSearchConsolidator))
})
