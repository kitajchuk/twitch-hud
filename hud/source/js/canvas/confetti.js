const getRandom = (min, max) => {
  return Math.random() * (max - min) + min
}

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min
}

const getRandomColor = () => {
  const colors = [
    'rgba(231, 76, 60, 1)', // red
    'rgba(241, 196, 15, 1)', // yellow
    'rgba(46, 204, 113, 1)', // green
    'rgba(52, 152, 219, 1)', // blue
    'rgba(155, 89, 182, 1)' // purple
  ]

  return colors[getRandomInt(0, colors.length)]
}

// Particle

class Particle {

  constructor (system, x, y) {
    this.system = system
    this.universe = this.system.world.universe
    this.x = x
    this.y = y
    this.color = getRandomColor()
    this.life = 1
    this.aging = getRandom(0.99, 0.999) // 0.99, 0.999 || 0.999, 0.9999

    this.r = getRandomInt(8, 16)
    this.speed = getRandom(3, 8)
    this.velocity = [
      getRandom(-this.speed, this.speed),
      getRandom(-this.speed, this.speed)
    ]
  }

  update (dt) {
    this.life *= this.aging

    if (
      this.r < 0.1
      || this.life === 0
      || this.x + this.r < 0
      || this.x - this.r > this.universe.width
      || this.y + this.r < 0
      || this.y - this.r > this.universe.height
    ) {
      this.system.removeObject(this)
    }

    this.r *= this.life
    this.x += this.velocity[0]
    this.y += this.velocity[1]
  }

  render (ctx) {
    // Main circle

    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    ctx.fill()
    ctx.closePath()

    const r = this.color.match(/([0-9]+)/g)[0]
    const g = this.color.match(/([0-9]+)/g)[1]
    const b = this.color.match(/([0-9]+)/g)[2]

    // Gradient

    const spread = 1.5
    const gradient = ctx.createRadialGradient(
      this.x, this.y, this.r,
      this.x, this.y, this.r * spread
    );
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r * spread, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.closePath()
    ctx.globalCompositeOperation = 'source-over'

    // Aberration

    const offset = this.r * 0.5
    const color = `rgba(${g}, ${b}, ${r}, 0.3)`

    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(this.x + offset, this.y + offset, this.r, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.closePath()
    ctx.globalCompositeOperation = 'source-over'
  }

}

// Crown

class Crown {

  constructor (system, x, y) {
    this.system = system
    this.x = x
    this.y = y
    this.r = getRandomInt(15, 20) // 5, 20
    this.mod = 1.1
    this.life = 1
    this.aging = getRandom(0.83, 0.88)
    this.speed = getRandom(4, 5)

    this.color = {
      r: getRandomInt(236, 242),
      g: getRandomInt(196, 241),
      b: getRandomInt(195, 242)
    }

    this.angle1 = Math.PI * getRandom(0, 2)
    this.angle2 = this.angle1 + Math.PI * getRandom(0.1, 0.5)
  }

  update (dt) {
    this.life *= this.aging

    if (this.life <= 0.0001) this.system.removeObject(this)

    this.r += Math.abs(1 - this.life) * this.speed

    this.x1 = this.x + this.r * Math.cos(this.angle1)
    this.y1 = this.y + this.r * Math.sin(this.angle1)

    this.angle3 = this.angle1 + ((this.angle2 - this.angle1) / 2)
    this.x2 = this.x + this.r * this.mod * Math.cos(this.angle3)
    this.y2 = this.y + this.r * this.mod * Math.sin(this.angle3)
  }

  render (ctx) {
    const gradient = ctx.createRadialGradient(
      this.x, this.y, this.r * 0.9,
      this.x, this.y, this.r
    );
    gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.life})`);
    gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.life * 0.5})`);

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, this.angle1, this.angle2, false)
    ctx.quadraticCurveTo(this.x2, this.y2, this.x1, this.y1)
    ctx.fill()
    ctx.closePath()
  }

}

// Explosion

class Explosion {

  constructor (world, x, y) {
    this.world = world
    this.x = x
    this.y = y
    this.objects = []

    let particles = getRandomInt(30, 80) // 10, 30 amount of particles
    let crowns = particles * getRandom(0.3, 0.5)

    while (crowns-- > 0) this.addCrown()
    while (particles-- > 0) this.addParticle()
  }

  update (dt) {
    this.objects.forEach((obj) => {
      if (obj) obj.update(dt)
    })

    if (this.objects.length <= 0) {
      this.world.clearExplosion(this)
    }
  }

  render (ctx) {
    this.objects.forEach((obj) => {
      if (obj) obj.render(ctx)
    })
  }

  addCrown () {
    this.objects.push(new Crown(this, this.x, this.y))
  }

  addParticle () {
    this.objects.push(new Particle(this, this.x, this.y))
  }

  removeObject (obj) {
    const index = this.objects.indexOf(obj)

    if (index !== -1) {
      this.objects.splice(index, 1)
    }
  }

}

// World

class ConfettiWorld {

  init () {
    this.objects = []
  }

  update (dt) {
    this.objects.forEach((obj) => {
      if (obj) obj.update(dt)
    })

    const amount = this.objects.reduce((sum, explosion) => {
      return sum += explosion.objects.length
    }, 0)
  }

  render (ctx) {
    this.objects.forEach((obj) => {
      if (obj) obj.render(ctx)
    })
  }

  explode (event) {
    const x = event.clientX
    const y = event.clientY

    this.objects.push(new Explosion(this, x, y))
  }

  clearExplosion (explosion) {
    const index = this.objects.indexOf(explosion)

    if (index !== -1) {
      this.objects.splice(index, 1)
    }
  }

}

// Time

class Time {

  constructor () {
    this.now = 0 // current tick time
    this.prev = 0 // prev tick time
    this.elapsed = 0 // elapsed time from last tick
    this.delta = 0 // time from last update
    this.fps = 60 // desired fps
    this.step = 1 / 60 // step duration
  }

  update (time) {
    this.now = time
    this.elapsed = (this.now - this.prev) / 1000
    this.prev = this.now
    this.delta += this.elapsed
  }

  raf (func) {
    this.rafId = window.requestAnimationFrame(func)
  }

  caf () {
    window.cancelAnimationFrame(this.rafId)
  }

  hasFrames () {
    return this.delta >= this.step
  }

  processFrame () {
    this.delta -= this.step
  }

}

// Canvas

class Universe {

  constructor (element) {
    this.el = element
    this.ctx = this.el.getContext('2d')
    this.pixelRatio = window.devicePixelRatio
    this.time = new Time

    this.worlds = {}
    this.world = null // current state

    this.updateSize()

    this.addWorld('confetti', ConfettiWorld)
    this.setWorld('confetti')
  }

  start () {
    this.time.raf(this.tick.bind(this))
    this.explodeRandom()
    this.interval = setInterval(() => {
      this.explodeRandom()
    },250)
  }

  tick (time) {
    this.time.update(time)

    if (this.time.hasFrames()) {
      this.update()
      this.time.processFrame()
    }

    this.render()
    this.time.raf(this.tick.bind(this))
  }

  update () {
    this.world.update(this.time.step)
  }

  render () {
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.world.render(this.ctx)
  }

  // Helpers

  updateSize () {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.el.width = this.width * this.pixelRatio
    this.el.height = this.height * this.pixelRatio
    this.el.style.width = window.innerWidth + 'px'
    this.el.style.height = window.innerHeight + 'px'
    this.ctx.scale(this.pixelRatio, this.pixelRatio)
  }

  addWorld (worldName, World) {
    this.worlds[worldName] = new World()
    this.worlds[worldName].universe = this
    this.worlds[worldName].init()
  }

  setWorld (worldName) {
    this.world = this.worlds[worldName]
  }

  explodeRandom () {
    this.worlds['confetti'].explode({
      clientX: getRandomInt(0, this.width),
      clientY: getRandomInt(0, this.height)
    })
  }

  destroy () {
    this.time.caf()
    this.ctx.clearRect(0, 0, this.width, this.height)
    clearTimeout(this.interval)
    this.interval = null
  }

}



const _export = {
  instance: new Universe(document.querySelector('#canvas'))
}



export default _export;
