import React from 'react'
import API from '../lib/api'

function filterByType (item) {
  return item.sys.contentType.sys.id === this
}

function isActiveItem (slug, query, isMenu) {
  if (query.page && query.detail && !isMenu) {
    return query.detail === slug
  } else if (query.page) {
    return query.page === slug
  } else if (slug === '/') {
    return slug === '/'
  }
}

export default (Component) => {
  class Data extends React.Component {
    static async getInitialProps ({ query }) {
      const cachedResponse = (typeof window !== 'undefined' && window.__NEXT_DATA__ && window.__NEXT_DATA__.props && window.__NEXT_DATA__.props._raw) ? window.__NEXT_DATA__.props._raw : null
      const getData = cachedResponse ? Promise.resolve(cachedResponse) : API.getContentfulEntries()

      return getData.then((items) => {
        const configs = items.filter(filterByType, 'config')
        const config = configs.length ? configs[0].fields : {}
        const currentItem = items.find((item) => {
          return isActiveItem(item.fields.slug, query)
        })

        // Exposed data
        const menu = config.menu.map((item) => {
          const isActive = isActiveItem(item.fields.slug, query, true)

          return {
            title: item.fields.menu || item.fields.title,
            slug: item.fields.slug,
            isActive: isActive,
            menuButton: item.fields.menuButton
          }
        })

        const header = {
          menu: menu,
          menuButtons: menu.filter((item) => item.menuButton)
        }

        const footer = {
          ctas: config.footerCtas.map((item) => {
            const title = item.fields.cta || item.fields.title

            return {
              title: title,
              slug: item.fields.slug
            }
          }),
          menu: config.footerMenu.map((item) => {
            return {
              title: item.fields.title,
              slug: item.fields.slug
            }
          }),
          socialMedia: config.footerSocialMedia.map((item) => {
            return {
              iconCharacter: item.fields.iconCharacter,
              alt: item.fields.title,
              url: item.fields.link
            }
          }),
          menuMeta: config.footerMenuMeta.map((item) => {
            return {
              title: item.fields.title,
              slug: item.fields.slug
            }
          })
        }

        const currentPageType = query.detail ? query.page : 'page'
        const currentPage = currentItem ? Object.assign({}, currentItem.fields) : null

        if (currentPage && currentPage.photo) {
          currentPage.photo = currentPage.photo.fields.file.url
        }

        if (currentPage && currentPage.bodyClass === 'home') {
          currentPage.isHome = true
        }

        const lead = currentPage ? {
          title: query.detail ? (menu.find((item) => item.isActive) || {}).title : currentPage.title,
          body: currentPage.lead ? currentPage.lead.replace(/(?:\r\n|\r|\n)/g, '<br />') : null,
          ctas: currentPage.leadCtas ? currentPage.leadCtas.map((item) => {
            const title = item.fields.cta || item.fields.title

            return {
              title: title,
              slug: item.fields.slug
            }
          }) : [],
          menu: query.detail && query.page !== 'news' ? items.filter(filterByType, currentItem.sys.contentType.sys.id).map((item) => {
            const title = item.fields.name || item.fields.title
            const isActive = isActiveItem(item.fields.slug, query)

            return {
              title,
              page: query.page,
              detail: item.fields.slug,
              isActive
            }
          }) : [],
          newsletter: currentPage.isHome,
          modifiers: currentPage.isHome ? ['bg-100'] : []
        } : null

        const news = currentPage && currentPage.showNews ? items.filter(filterByType, 'news').map((item) => {
          return {
            title: item.fields.title,
            page: 'news',
            detail: item.fields.slug,
            date: item.fields.date
          }
        }) : null

        const hosts = currentPage && currentPage.showSpeakers ? items.filter(filterByType, 'host').map((item) => {
          const photo = item.fields.photo ? item.fields.photo.fields.file.url : null

          return {
            name: item.fields.name,
            page: 'hosts',
            detail: item.fields.slug,
            description: item.fields.description,
            photo: photo
          }
        }) : null

        const speakers = currentPage && currentPage.showSpeakers ? items.filter(filterByType, 'speaker').map((item) => {
          const photo = item.fields.photo ? item.fields.photo.fields.file.url : null

          return {
            name: item.fields.name,
            page: 'speakers',
            detail: item.fields.slug,
            description: item.fields.description,
            photo: photo
          }
        }) : null

        const workshops = currentPage && currentPage.showWorkshops ? items.filter(filterByType, 'workshop').map((item) => {
          const photo = item.fields.photo ? item.fields.photo.fields.file.url : null

          return {
            name: item.fields.title,
            page: 'workshops',
            detail: item.fields.slug,
            description: item.fields.description,
            photo: photo
          }
        }) : null

        const venue = currentPage && currentPage.showVenue && config.venueTeaser ? items.find((item) => {
          return item.sys.id === config.venueTeaser.sys.id
        }).fields : null

        const jobs = currentPage && currentPage.showJobs ? [] : null

        const sponsors = currentPage && currentPage.showSponsors ? items.filter(filterByType, 'sponsorCategory').map((item) => {
          const teaser = item.fields.teaser ? items.filter(filterByType, 'teaser').find((teaser) => {
            return teaser.sys.id === item.fields.teaser.sys.id
          }).fields : null

          return {
            title: item.fields.title,
            color: item.fields.color,
            level: item.fields.level,
            items: [],
            id: item.sys.id,
            cssClass: item.fields.cssClass,
            cssClassItems: item.fields.cssClassItems,
            teaser,
            cssClassTeaser: item.fields.cssClassTeaser
          }
        }).sort((a, b) => a.level - b.level) : null

        if (sponsors) {
          items.filter(filterByType, 'sponsor').forEach((item) => {
            const category = sponsors.find((category) => category.id === item.fields.category.sys.id)
            const logo = item.fields.logo ? item.fields.logo.fields.file.url : null

            if (!category) {
              return
            }

            category.items.push({
              title: item.fields.title,
              link: item.fields.link,
              logo
            })
          })
        }

        const scripts = currentPage && currentPage.config && currentPage.config.scripts ? currentPage.config.scripts : []
        const styles = currentPage && currentPage.config && currentPage.config.styles ? currentPage.config.styles : []

        return {
          header,
          footer,
          currentPage,
          currentPageType,
          lead,
          news,
          hosts,
          speakers,
          workshops,
          venue,
          jobs,
          sponsors,
          scripts,
          styles,
          _raw: items
        }
      })
    }

    render () {
      return <Component {...this.props} />
    }
  }

  return Data
}
