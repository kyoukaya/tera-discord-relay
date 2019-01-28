const emoji = require('./emoji')

// helpers
function escapeRegExp (s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

const unHtml = (() => {
  const replacements = {
    'quot': '"',
    'amp': '&',
    'lt': '<',
    'gt': '>'
  }

  return function unHtml (s) {
    return (s
      .replace(/<.*?>/g, '')
      .replace(/&(quot|amp|lt|gt);/g, (_, $1) => replacements[$1])
    )
  }
})()

function emojify (s) {
  return emoji.replaceColons(s)
}

const unemojify = (() => {
  const shortcuts = {
    broken_heart: '</3',
    confused: ':-/',
    frowning: ':(',
    heart: '<3',
    hearts: '<3',
    neutral_face: ':|',
    open_mouth: ':o',
    smile: ':D',
    smiley: ':)',
    stuck_out_tongue: ':P',
    sunglasses: '8)',
    unamused: ':s',
    wink: ';)'
  }

  const regex = new RegExp(`:(${Object.keys(shortcuts).join('|')}):`, 'g')

  return function unemojify (s) {
    return emoji.replaceUnicode(s).replace(regex, (_, $1) => shortcuts[$1])
  }
})()

function replaceAll (string, search, replace) {
  return string.replace(new RegExp(escapeRegExp(search), 'gi'), replace)
}

function getServer (bot, id) {
  const server = bot.guilds.get(id)
  if (!server) {
    console.error('server "%s" not found', id)
    console.error('servers:')
    bot.guilds.forEach((s, id) => console.error('- %s (%s)', s.name, id))
    return null
  }
  return server
}

function getTextChannel (server, id) {
  const channel = server.channels.get(id)
  if (!channel || channel.type !== 'text') {
    console.error('text channel "%s" not found', id)
    console.error('channels:')
    server.channels.forEach((c, id) => {
      if (c.type !== 'text') {
        console.error('- #%s (%s)', c.name, id)
      }
    })
    return null
  }
  return channel
}

function getName (server, user) {
  const details = server.members.get(user && user.id)
  return (details && details.nickname) || (user && user.username) || '(???)'
}

function toDiscord (message, server) {
  // convert @mention
  // 1 - nicknames
  server.members.forEach(member => {
    if (member.nickname != null) {
      message = replaceAll(message, '@' + member.nickname, member.toString())
    }
  })

  // 2 - usernames
  server.members.forEach(member => {
    message = replaceAll(message, '@' + member.user.username, member.toString())
  })

  // convert #channel
  server.channels.forEach(channel => {
    if (channel.type === 'text') {
      message = replaceAll(message, '#' + channel.name, channel.toString())
    }
  })

  // convert @role
  server.roles.forEach(role => {
    message = replaceAll(message, '@' + role.name, role.toString())
  })

  // TODO convert :emoji:
  server.emojis.forEach(emoji => {
    message = replaceAll(message, ':' + emoji.name + ':', emoji.toString())
  })

  // return
  return message
}

function fromDiscord (message, server) {
  return (message
    // @user, @!user
    .replace(/<@!?(\d+)>/g, (_, mention) => {
      const m = server.members.get(mention)
      return '@' + ((m && getName(server, m.user)) || '(???)')
    })
    // #channel
    .replace(/<#(\d+)>/g, (_, mention) => {
      const m = server.channels.get(mention)
      return '#' + ((m && m.name) || '(???)')
    })
    // @role
    .replace(/<@&(\d+)>/g, (_, mention) => {
      const m = server.roles.get(mention)
      return '@' + ((m && m.name) || '(???)')
    })
    // :emoji:
    .replace(/<:(\w+):(\d+)>/g, (_, mention) => ':' + mention + ':')
  )
}

function sendMessge (channel, message, options) {
  channel.send(message, options).catch(console.error)
}

// exports
module.exports = {
  escapeRegExp,
  unHtml,
  emojify,
  unemojify,
  replaceAll,
  getServer,
  getTextChannel,
  getName,
  toDiscord,
  fromDiscord,
  sendMessge
}
