const U = require('./util')

module.exports = function lfgModule (app, config) {
  if (!config.channels['entry']) return

  const { bot, ipc } = app

  bot.once('ready', () => {
    const server = U.getServer(bot, config['server-id'])
    if (!server) {
      console.warn('* entry module is disabled')
      return
    }

    const channel = U.getTextChannel(server, config.channels['world'])
    if (!channel) {
      console.warn('* world channel disabled')
    }

    console.log('routing lfg to #%s (%s)', channel.name, channel.id)

    ipc.on('world', (author, message) => {
      message = U.emojify(U.unHtml(message), server)
      U.sendMessge(channel, `[${author}]: ${message}`, { disable_everyone: true })
    })
  })
}
