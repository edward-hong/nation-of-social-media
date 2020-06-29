$(document).ready(function () {
  new jvm.MultiMap({
    container: $('#usa-map'),
    maxLevel: 1,
    main: { map: 'us_lcc', backgroundColor: '#191919' },
    subMapsOptions: { backgroundColor: '#191919' },
    mapUrlByCode: function (code, multiMap, config) {
      return (
        '../maps/us/jquery-jvectormap-data-' +
        code.toLowerCase() +
        '-' +
        multiMap.defaultProjection +
        '-en.js'
      )
    },
  })

  function plurality(num, area) {
    if (num === 1) {
      return area === 'state' ? `the state of Wyoming` : `1 county`
    } else {
      return area === 'state'
        ? `${num} different US states`
        : `${num} different counties`
    }
  }

  function derivePlatformFromColor(color) {
    switch (color) {
      case '#009cfa':
        return 'Twitter followers'
      case '#7031d1':
        return 'Instagram followers'
      default:
        return 'Youtube subscribers'
    }
  }

  function renderMap(followers, color, name, number) {
    const platform = derivePlatformFromColor(color)

    const usaPopKeys = Object.keys(usaPop)
    const condObj = usaPopKeys.reduce(function assignConditions(acc, curr) {
      if (followers > usaPop[curr]) {
        acc[curr] = 2
      } else {
        acc[curr] = 1
      }
      return acc
    }, {})

    const tempCountCounties = Object.values(condObj).filter((a) => a === 2)
      .length
    const countStateCounties = {
      ...numOfCounties,
      US:
        followers > usaPop['US-DC'] ? tempCountCounties - 1 : tempCountCounties,
    }

    const usaStatePopKeys = Object.keys(usaStatePop)
    const condStateObj = usaStatePopKeys.reduce(function assignStateConditions(
      acc,
      curr,
    ) {
      if (followers > usaStatePop[curr]) {
        acc[curr] = 2
      } else {
        acc[curr] = 1
      }
      return acc
    },
    {})

    const countMoreThan = usaStatePopKeys.reduce(function aggregateMorethan(
      acc,
      curr,
    ) {
      const property = curr.slice(0, 2)
      if (followers > usaStatePop[curr]) {
        return { ...acc, [property]: (acc[property] || 0) + 1 }
      } else {
        return { ...acc, [property]: acc[property] || 0 }
      }
    },
    {})

    const countMoreThanKeys = Object.keys(countMoreThan)

    const countCounties = countMoreThanKeys.reduce(
      function allocateMoreThan(acc, curr) {
        const tempObj = {
          ...acc,
          [codeState[curr]]: {
            ...countStateCounties[codeState[curr]],
            moreThan: countMoreThan[curr],
          },
        }
        return tempObj
      },
      { US: countStateCounties.US },
    )

    $('#usa-map').empty()
    $('.jvectormap-tip').remove()
    new jvm.MultiMap({
      container: $('#usa-map'),
      maxLevel: 1,
      main: {
        map: 'us_lcc',
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
            `${el.html()} (Population - ${numberWithCommas(usaPop[code])})`,
          )
        },
      },
      subMapsOptions: {
        backgroundColor: '#191919',
        series: {
          regions: [
            {
              values: condStateObj,
              scale: { '1': '#fff', '2': color },
              attribute: 'fill',
            },
          ],
        },
        onRegionTipShow: (e, el, code) => {
          el.html(
            `${el.html()} (Population - ${numberWithCommas(
              usaStatePop[code],
            )})`,
          )
        },
      },
      mapUrlByCode: function (code, multiMap, config) {
        handleSearchResults(
          name,
          number,
          platform,
          `${plurality(
            countCounties[code].moreThan,
            'county',
          )} in the state of ${countCounties[code].name}`,
        )
        $('.jvectormap-goback').click(
          handleSearchResults.bind(
            null,
            name,
            number,
            platform,
            plurality(countCounties.US, 'state'),
          ),
        )
        return (
          '../maps/us/jquery-jvectormap-data-' +
          code.toLowerCase() +
          '-' +
          multiMap.defaultProjection +
          '-en.js'
        )
      },
    })
    return countCounties
  }

  function handleSearchGenerator(
    getSearchType,
    getChannelDataFromSearchedResults,
    invalidUsernameMessage,
    plurality,
    numberWithCommas,
    handleSearchResults,
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
                  const countObj = renderMap(
                    subscribers,
                    '#f00',
                    channelTitle,
                    numberWithCommas(subscribers),
                  )

                  handleSearchResults(
                    channelTitle,
                    numberWithCommas(subscribers),
                    'Youtube subscribers',
                    plurality(countObj.US, 'state'),
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
                  const countObj = renderMap(
                    followers,
                    '#009cfa',
                    username,
                    numberWithCommas(followers),
                  )

                  handleSearchResults(
                    username,
                    numberWithCommas(followers),
                    'Twitter followers',
                    plurality(countObj.US, 'state'),
                  )
                }
              })
            break
          case 'instagram':
            const searchInstagramUrl = `https://www.instagram.com/web/search/topsearch/?query=${username}`
            $.getJSON(searchInstagramUrl).then(({ users }) => {
              if (users.length !== 0) {
                const followers = users.filter(function matchInstaUsername({
                  user,
                }) {
                  return user.username === username
                })
                if (followers.length !== 0) {
                  const {
                    username: account,
                    follower_count: followersCount,
                  } = followers[0].user
                  const countObj = renderMap(
                    followersCount,
                    '#7031d1',
                    account,
                    numberWithCommas(followersCount),
                  )

                  handleSearchResults(
                    account,
                    numberWithCommas(followersCount),
                    'Instagram followers',
                    plurality(countObj.US, 'state'),
                  )
                } else {
                  invalidUsernameMessage('Instagram handle')
                }
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
    handleSearchResults,
    renderMap,
  )

  $('#search-icon').click(handleClickedSearch(handleSearchConsolidator))
  $('#search-bar').keypress(handleKeypressedSearch(handleSearchConsolidator))
})
