// noinspection JSDeprecatedSymbols

import './css/style.css'

import gsap from 'gsap'
import $ from 'jquery'

const shareURL = 'https://greensock.com/docs/v3/Eases?CustomEase='

let id = 0
let timeline
let $menuEases
let highlightTween
let isLoaded
let _numbersExp = /(-)?\d*\.?\d*(?:e[\-+]?\d+)?[0-9]/ig
let _rawPathDataExp = /\bd=["']+.*["'][\s\/>]/i
let _copyElement

const _createElement = function(type, ns) {
  // some servers swap in https for http in the namespace which can break things, making "style" inaccessible
  const e = document.createElementNS
    ? document.createElementNS((ns || 'http://www.w3.org/1999/xhtml')
      .replace(/^https/, 'http'), type)
    : document.createElement(type)

  // some environments won't allow access to the element's style when created with a namespace in which case we default
  // to the standard createElement() to work around the issue. Also note that when GSAP is embedded directly inside an SVG file,
  // createElement() won't allow access to the style object in Firefox
  return e.style ? e : document.createElement(type)
}

const defaults = {
  startEase:  'power2',
  lightTheme: false,
  lockEase:   false
}

const customStrings = {
  "power0.out":   "0,0,1,1",
  "power1.out":   "0.104,0.204,0.492,1",
  "power2.out":   "M0,0,C0.126,0.382,0.282,0.674,0.44,0.822,0.632,1.002,0.818,1.001,1,1",
  "power3.out":   "M0,0,C0.083,0.294,0.182,0.718,0.448,0.908,0.579,1.001,0.752,1,1,1",
  "power4.out":   "M0,0,C0.11,0.494,0.192,0.726,0.318,0.852,0.45,0.984,0.504,1,1,1",
  "back.out":     "M0,0,C0.128,0.572,0.257,1.016,0.512,1.09,0.672,1.136,0.838,1,1,1",
  "elastic.out":  "M0,0,C0,0,0.049,0.675,0.085,1.115,0.122,1.498,0.156,1.34,0.16,1.322,0.189,1.193,0.203,1.111,0.23,0.978,0.262,0.818,0.303,0.876,0.307,0.882,0.335,0.925,0.349,0.965,0.38,1.006,0.43,1.088,0.484,1.022,0.53,0.997,0.58,0.964,0.667,1.002,0.725,1.004,0.829,1.008,1,1,1,1",
  "bounce.out":   "M0,0,C0.14,0,0.242,0.438,0.272,0.561,0.313,0.728,0.354,0.963,0.362,1,0.37,0.985,0.414,0.873,0.455,0.811,0.51,0.726,0.573,0.753,0.586,0.762,0.662,0.812,0.719,0.981,0.726,0.998,0.788,0.914,0.84,0.936,0.859,0.95,0.878,0.964,0.897,0.985,0.911,0.998,0.922,0.994,0.939,0.984,0.954,0.984,0.969,0.984,1,1,1,1",
  "circ.out":     "M0,0,C0,0.408,0.242,0.657,0.295,0.709,0.346,0.76,0.584,1,1,1",
  "expo.out":     "M0,0,C0.084,0.61,0.214,0.802,0.28,0.856,0.356,0.918,0.374,1,1,1",
  "sine.out":     "M0,0,C0.266,0.412,0.436,0.654,0.565,0.775,0.609,0.816,0.78,1,1,1",
  "power1.in":    "0.532,0,0.924,0.862",
  "power2.in":    "M0,0,C0.366,0,0.438,0.069,0.575,0.19,0.802,0.39,1,1,1,1",
  "power3.in":    "M0,0,C0.482,0,0.49,0.046,0.625,0.152,0.733,0.237,0.88,0.524,1,1",
  "power4.in":    "M0,0,C0.46,0,0.496,0.014,0.616,0.088,0.734,0.161,0.884,0.4,1,1",
  "back.in":      "M0,0,C0.192,0,0.33,-0.152,0.522,-0.078,0.641,-0.031,0.832,0.19,1,1",
  "circ.in":      "M0,0,C0.42,0,0.658,0.243,0.71,0.295,0.762,0.348,1,0.59,1,1",
  "expo.in":      "M0,0,C0.5,0,0.581,0.047,0.625,0.073,0.72,0.13,0.9,0.23,1,1",
  "sine.in":      "0.434,0.004,0.79,0.698",
  "power1.inOut": "M0,0,C0.272,0,0.472,0.455,0.496,0.496,0.574,0.63,0.744,1,1,1",
  "power2.inOut": "M0,0,C0.173,0,0.242,0.036,0.322,0.13,0.401,0.223,0.449,0.367,0.502,0.506,0.546,0.622,0.62,0.824,0.726,0.916,0.799,0.98,0.869,1,1,1",
  "power3.inOut": "M0,0 C0.212,0 0.247,0.014 0.326,0.09 0.402,0.164 0.46,0.356 0.502,0.504 0.551,0.68 0.594,0.816 0.654,0.882 0.726,0.961 0.734,1 1,1",
  "power4.inOut": "M0,0,C0.29,0,0.294,0.018,0.365,0.103,0.434,0.186,0.466,0.362,0.498,0.502,0.518,0.592,0.552,0.77,0.615,0.864,0.69,0.975,0.704,1,1,1",
  "back.inOut":   "M0,0,C0.068,0,0.128,-0.061,0.175,-0.081,0.224,-0.102,0.267,-0.107,0.315,-0.065,0.384,-0.004,0.449,0.253,0.465,0.323,0.505,0.501,0.521,0.602,0.56,0.779,0.588,0.908,0.651,1.042,0.705,1.082,0.748,1.114,0.799,1.094,0.817,1.085,0.868,1.061,0.938,0.998,1,1",
  "circ.inOut":   "M0,0,C0.17,0,0.286,0.085,0.32,0.115,0.394,0.18,0.498,0.3,0.5,0.5,0.502,0.706,0.608,0.816,0.645,0.852,0.67,0.877,0.794,1,1,1",
  "expo.inOut":   "M0,0,C0.25,0,0.294,0.023,0.335,0.05,0.428,0.11,0.466,0.292,0.498,0.502,0.532,0.73,0.586,0.88,0.64,0.928,0.679,0.962,0.698,1,1,1",
  "sine.inOut":   "M0,0,C0.2,0,0.374,0.306,0.507,0.512,0.652,0.738,0.822,1,1,1"
}

const customSVG = {
  "power0.out":   "M0,500 C0,500 500,0 500,0",
  "power1.out":   "M0,500 C52,398 246,0 500,0",
  "power2.out":   "M0,500 C63,309 141,163 220,89 316,-1 409,-0.499 500,0",
  "power3.out":   "M0,500 C41.5,353 91,141 224,46 289.5,-0.499 376,0 500,0",
  "power4.out":   "M0,500 C55,253 96,137 159,74 225,8 252,0 500,0",
  "back.out":     "M0,500 C64,214 128.5,-8 256,-45 336,-68 419,0 500,0",
  "elastic.out":  "M0,500 C0,500 24.5,162.5 42.5,-57.5 61,-249 78,-170 80,-161 94.5,-96.5 101.5,-55.5 115,11 131,91 151.5,62 153.5,59 167.5,37.5 174.5,17.5 190,-3 215,-44 242,-11 265,1.5 290,18 333.5,-1 362.5,-2 414.5,-4 500,0 500,0",
  "bounce.out":   "M0,500 C70,500 121,281 136,219.5 156.5,136 177,18.5 181,0 185,7.5 207,63.5 227.5,94.5 255,137 286.5,123.5 293,119 331,94 359.5,9.5 363,1 394,43 420,32 429.5,25 439,18 448.5,7.5 455.5,1 461,3 469.5,8 477,8 484.5,8 500,0 500,0",
  "circ.out":     "M0,500 C0,296 121,171.5 147.5,145.5 173,120 292,0 500,0",
  "expo.out":     "M0,500 C42,195 107,99 140,72 178,41 187,0 500,0",
  "sine.out":     "M0,500 C133,294 218,173 282.5,112.5 304.5,92 390,0 500,0",
  "power1.in":    "M0,500 C266,500 462,69 500,0",
  "power2.in":    "M0,500 C183,500 219,465.5 287.5,405 401,305 500,0 500,0",
  "power3.in":    "M0,500 C241,500 245,477 312.5,424 366.5,381.5 440,238 500,0",
  "power4.in":    "M0,500 C230,500 248,493 308,456 367,419.5 442,300 500,0",
  "back.in":      "M0,500 C96,500 165,576 261,539 320.5,515.5 416,405 500,0",
  "circ.in":      "M0,500 C210,500 329,378.5 355,352.5 381,326 500,205 500,0",
  "expo.in":      "M0,500 C250,500 290.5,476.5 312.5,463.5 360,435 450,385 500,0",
  "sine.in":      "M0,500 C217,498 395,151 500,0",
  "power1.inOut": "M0,500 C136,500 236,272.5 248,252 287,185 372,0 500,0",
  "power2.inOut": "M0,500 C86.5,500 121,482 161,435 200.5,388.5 224.5,316.5 251,247 273,189 310,88 363,42 399.5,10 434.5,0 500,0",
  "power3.inOut": "M0,500 C106,500 123.5,493 163,455 201,418 230,322 251,248 275.5,160 297,92 327,59 363,19.5 367,0 500,0",
  "power4.inOut": "M0,500 C145,500 147,491 182.5,448.5 217,407 233,319 249,249 259,204 276,115 307.5,68 345,12.5 352,0 500,0",
  "back.inOut":   "M0,500 C34,500 64,530.5 87.5,540.5 112,551 133.5,553.5 157.5,532.5 192,502 224.5,373.5 232.5,338.5 252.5,249.5 260.5,199 280,110.5 294,46 325.5,-21 352.5,-41 374,-57 399.5,-47 408.5,-42.5 434,-30.5 469,1 500,0",
  "circ.inOut":   "M0,500 C85,500 143,457.5 160,442.5 197,410 249,350 250,250 251,147 304,92 322.5,74 335,61.5 397,0 500,0",
  "expo.inOut":   "M0,500 C125,500 147,488.5 167.5,475 214,445 233,354 249,249 266,135 293,60 320,36 339.5,19 349,0 500,0",
  "sine.inOut":   "M0,500 C100,500 187,347 253.5,244 326,131 411,0 500,0"
}

const _createSVG = function(type, container, attributes, insertBefore) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', type),
    reg = /([a-z])([A-Z])/g

  for (const p in attributes) {
    element.setAttributeNS(
      null,
      p.replace(reg, '$1-$2').toLowerCase(),
      attributes[p]
    )
  }
  if (insertBefore) {
    container.parentNode.insertBefore(element, container)
  } else {
    container.appendChild(element)
  }

  return element
}

const methods = {
  init: function(options) {
    const settings = $.extend({}, defaults, options)

    return this.each(function() {
      const vis = $(this)
      const data = vis.data('easeVisualizer')

      if (!data) {
        vis.data('easeVisualizer', {
          id:                id++,
          settings:          settings,
          active:            true,
          graphTL:           null,
          clockTL:           null,
          boxTL:             null,
          currentVis:        'graph',
          currentDuration:   2.5,
          currentEaseName:   'power2',
          currentEaseString: null,
          currentEase:       null,
          editMode:          false
        })

        loaded(
          window.easeVisualizerHTML ??= $('.ease-visualizer').html(),
          vis
        )
      }
    })
  }
}

function loaded(html, vis)
{
  let data = vis.data('easeVisualizer'),
    startingEaseName,
    easeMenuWidth,
    customEase,
    lastIndex,
    i

  if (data.settings.lightTheme === true) {
    vis.addClass('light')
  }

  vis.addClass('ease_visualizer')
  vis.addClass('enabled')

  gsap.registerPlugin(window.MorphSVGPlugin, window.CustomEase, window.RoughEase, window.SlowMo)

  easeMenuWidth = vis.innerWidth() - 595

  if (easeMenuWidth < 200 || !easeMenuWidth) {
    easeMenuWidth = 200
  }

  $menuEases = $('.ease_menu .ease_class')

  $('.ease_menu')
    .css('width', easeMenuWidth + 'px')
    .on('click', '.ease_class', { vis }, onMenuEaseClick)

  const main_ease_class_select = vis.find('.main_ease_class_select')

  // run button
  vis.find('.go').css('width', easeMenuWidth + 'px').on('click.easeVisualizer', { vis }, onClickRun)

  // select options
  vis.find('select, input')
    .on('change.easeVisualizer', { vis }, selectChange)
    .each(function() {
      const t = $(this)

      t.wrap("<label class='" + t.data('type') + "_label'></label>")
        .after("<span class='display'></span>")
    })
    .trigger('change')

  vis.find('.editable')
    .attr('tabindex', '-1')
    .on('change.easeVisualizer', function() {
      $(this).siblings('.display').focus()
    })
    .siblings('.display')
    .attr('contenteditable', 'true')
    .attr('spellcheck', 'true')

  // ease selector
  if (data.settings.lockEase !== true) {
    vis.find('.ease_selector')
      .css({ display: 'none', opacity: 0 })
      .on('click', 'button', { vis }, easeChange)
      .trigger('change')

    vis.find('.main_ease_class_label')
      .on('mousedown.easeVisualizer', { vis }, showVisSelect)

  } else {
    vis.find('.ease_selector').css({
      display: 'none',
      opacity: 0
    })

    main_ease_class_select.css('display', 'none').parent()
      .addClass('locked')
  }

  vis.find('.custom_path').on('focusout.easeVisualizer', { vis }, onInputCustomPath)
  vis.find('.main_ease_class_select').css('visibility', 'hidden')

  const prependElement = vis.find('.graph_lines')[0]

  for (i = 1; i < 13; i++) {
    _createSVG('line', prependElement, {
      x1: i * 50,
      x2: i * 50,
      y1: -150,
      y2: 500,
      stroke: '#222',
      strokeWidth: 1,
      vectorEffect: 'non-scaling-stroke'
    })

    if (i !== 3) {
      _createSVG('line', prependElement, {
        x1: 0,
        x2: 500,
        y1: i * 50 - 150,
        y2: i * 50 - 150,
        stroke: '#222',
        strokeWidth: 1,
        vectorEffect: 'non-scaling-stroke'
      })
    }
  }

  _createSVG('line', prependElement, {
    x1: 0,
    x2: 500,
    y1: 0,
    y2: 0,
    stroke: '#777',
    strokeWidth: 1,
    vectorEffect: 'non-scaling-stroke'
  })

  isLoaded = true

  // look in the URL for a CustomEase
  i = window.location.href.indexOf('CustomEase=')

  if (i !== -1) {
    lastIndex = window.location.href.indexOf('&', i)

    customEase = decodeURI((lastIndex !== -1)
      ? window.location.href.substr(i + 11, lastIndex - i - 11)
      : window.location.href.substr(i + 11))

    data.settings.startEase = 'CustomEase'

    vis.find('.custom_path').text(customEase)

    // in case "CustomEase" is selected initially but no actual ease data passed into the URL,
    // we must first default to an ease to trace, so we use power2.out
  } else if (data.settings.startEase === 'CustomEase') {
    main_ease_class_select
      .find('option[value="power2"]')
      .prop('selected', true)
      .trigger('change')
  }

  data.settings.startEase ||= 'power2.out'
  startingEaseName = parseEaseClass(data.settings.startEase, true)
  highlightMenuEase(startingEaseName)

  main_ease_class_select
    .find('option[value="' + parseEaseClass(data.settings.startEase) + '"]')
    .prop('selected', true)
    .trigger('change')

  if (timeline) {
    timeline.delay(1.5)
  }

  // COPY/PASTE START
  _copyElement = _createElement('textarea')
  _copyElement.style.display = 'none'

  document.body.appendChild(_copyElement)

  $('.command').on('copy', () => {
    _copyElement.value = document.getSelection().toString()

    if (_copyElement.select) {
      _copyElement.style.display = 'block'
      _copyElement.select()

      try {
        document.execCommand('copy')
        _copyElement.blur()
      } catch (err) {
      }

      _copyElement.style.display = 'none'
    }
  })
  // COPY/PASTE END

  vis.find('.copy-button').on('click.easeVisualizer', { vis }, onCopyClick)
  vis.find('.share-button').on('click.easeVisualizer', { vis }, onShareClick)
}

function parseEaseClass(name, short)
{
  name = name.split('.')[0]

  if (short) {
    return (name === 'rough')
      ? 'rough'
      : (name === 'steps')
        ? 'steps'
        : name
  }

  return (name === 'rough')
    ? 'rough'
    : (name === 'steps')
      ? 'steps'
      : (name === 'Custom')
        ? 'CustomEase'
        : name
}

function showVisSelect(e)
{
  e.preventDefault()
  e.stopPropagation()

  const vis = e.data.vis

  window.showBasicOverlay(
    vis.find('.ease_selector').focus(),
    hideVisSelect.bind(null, vis)
  )

  return false
}

function hideVisSelect(vis)
{
  vis.find('.main_ease_class_label').css('visibility', 'visible')

  window.hideBasicOverlay()
}

function onMenuEaseClick(e)
{
  // returns true if the ease was already selected
  if (highlightMenuEase(this.textContent)) {
    if (timeline) {
      timeline.restart()
    }

    return
  }

  e.data.vis
    .find('.main_ease_class_select')
    .find('option[value="' + parseEaseClass(this.textContent) + '"]')
    .prop('selected', true)
    .trigger('change')
}

function highlightMenuEase(name)
{
  if (name === 'CustomEase') {
    name = 'Custom'
  }
  if (highlightTween) { // a simple, performant way to unhighlight the previous ease
    // if it's the same target, it means the user clicked on the already-highlighted ease, so do nothing
    if (highlightTween.targets()[0].textContent !== name) {
      gsap.to(highlightTween.targets()[0], {
        clearProps: 'backgroundColor,color',
        backgroundColor: 'rgba(0,0,0,0)',
        duration: 0.2,
        color: '#777'
      })
    } else {
      return true
    }
  }

  let i = $menuEases.length

  while (--i > -1) {
    if ($menuEases[i].textContent === name) {
      highlightTween = gsap.to($menuEases[i], {
        duration: 0.2,
        backgroundColor: '#88CE02',
        color: 'black'
      })
    }
  }

  $menuEases.siblings('.ease_type_section').css('visibility',
    (name === 'rough' || name === 'steps' || name === 'slow' || name === 'none' || name === 'Custom')
      ? 'hidden'
      : 'visible'
  )
}

function easeChange(e)
{
  const vis = e.data.vis
  const main_ease_class_select = vis.find('.main_ease_class_select')
  const basic_ease_type_select = vis.find('.basic_ease_type_select')
  const button = $(this)
  const val = button.attr("class").split(" ")

  main_ease_class_select.find('option[value="' + val[0] + '"]').prop("selected", true).trigger('change')

  if (val[1] && val[1] !== 'easeNone') {
    basic_ease_type_select.find('option[value="' + val[1] + '"]').prop("selected", true).trigger('change')
  }

  highlightMenuEase(parseEaseClass(val[0], true))

  hideVisSelect(vis)
}

function selectChange(e)
{
  const vis = e.data.vis
  const element = $(this)
  const isSelect = element.is('select')
  const type = element.data('type')
  const value = isSelect ? element.val() : element.prop('checked')

  if (isSelect) {
    const display = element.siblings('.display').text(value)
    const width = display.width()

    if (width !== 0) {
      element.width(width)
    }
  } else {
    element.siblings('.display').text(value ? 'true' : 'false')
  }

  switch (type) {
    case 'ease_type_quick':
      vis.find('.basic_ease_type_select').find('option[value="' + value + '"]').prop('selected', true).trigger('change')
      return

    case 'target': {
      const all = vis.find('.visualization')
      const allprops = vis.find('.prop')

      switch (value) {
        case 'graph':
          showOnly(vis.find('.graph'), all)
          showOnly(vis.find('.prop_graph'), allprops)
          break;
        case 'clock':
          showOnly(vis.find('.clock'), all)
          showOnly(vis.find('.prop_clock'), allprops)
          break;
        case 'box':
          showOnly(vis.find('.box'), all)
          showOnly(vis.find('.prop_box'), allprops)
          break;
      }
    }
      break

    case 'main_ease_class': {
      const all = vis.find('.main_ease_type')
      const data = vis.data('easeVisualizer')

      gsap.set('.basic_ease, .display, .ease-visualizer .dot, .easeQuotes', { display: '' })

      data.editMode = false

      switch (value) {
        case 'none':
          // showOnly(vis.find(".linear_ease"), vis.find(".basic_ease, .display, .dot"))
          // Fixes issue that no tween target is visible when "none" is selected
          showOnly(vis.find('.linear_ease'), all);
          break
        case 'rough':
          showOnly(vis.find('.rough_ease'), all)
          break
        case 'slow':
          showOnly(vis.find('.slowmo_ease'), all)
          break
        case 'steps':
          showOnly(vis.find('.stepped_ease'), all)
          break
        case 'elastic':
          showOnly(vis.find('.elastic_ease'), all)
          break
        case 'back':
          showOnly(vis.find('.back_ease'), all)
          break
        case 'CustomEase':
          showOnly(vis.find('.custom_ease'), all)

          gsap.set('.easeQuotes', { display: 'none' })
          data.editMode = true
          break
        default:
          showOnly(vis.find('.basic_ease'), all)
      }

      checkVertical(vis)

      vis.toggleClass("editMode", data.editMode)
    }
      break

    case 'rough_ease_class': {
      const all = vis.find('.rough_ease_type')

      switch (value) {
        case 'power0':
          showOnly(vis.find('.rough_linear_ease'), all)
          break
        default:
          showOnly(vis.find('.rough_basic_ease'), all)
      }

      checkVertical(vis)
    }
      break

    case 'main_basic_ease_type': {
      checkVertical(vis)

      vis.find('.ease_type_quick_select').find('option[value="' + value + '"]').prop('selected', true)
      vis.find('.ease_type_quick_select').siblings(".display").text(value)
    }
      break

    case 'rough_basic_ease_type': {
      checkVertical(vis)
    }
      break

    case 'rough_randomize':
    case 'rough_taper':
    case 'rough_clamp':
    case 'slowmo_yoyo':
      break
  }

  refreshTween(vis)
  customMode(vis, vis.data('easeVisualizer').currentEaseName === 'CustomEase')
  run(null, vis)
}

function customMode(vis, enabled)
{
  const unset = preventRedirect()

  if (vis.custom !== enabled) {
    vis.custom = enabled

    let path = vis.find('.ease_template')[0],
      ease = vis.data('easeVisualizer').currentEase,
      text = vis.find('.custom_path')[0],
      hasError,
      onEaseError = () => {
        hasError = true
      }

    const target = vis.find('.target_select').val()

    if (enabled && target === 'graph') {
      path.style.visibility = 'visible'
      gsap.fromTo('.ease-instructions', { y: 50 }, { duration: 0.3, autoAlpha: 1, y: 0, delay: 0.2 })
      path.setAttribute('d', window.CustomEase.getSVGData(ease, { width: 500, height: 500 }))

      if (vis.editor) {
        vis.editor.enabled(true)
        vis.editor.select()

      } else {
        vis.editor = new window.PathEditor(path, {
          draggable: false,
          anchorSnap: window.PathEditor.getSnapFunction({
            x: 0,
            y: 0,
            width: 500,
            height: 500,
            containY: false,
            gridSize: 50,
            radius: 5,
            axis: window.PathEditor.editingAxis
          }),
          onUpdate() {
            const hadError = hasError,
              rawPath = this._rawPath || this._bezier,
              lastX = rawPath[0][rawPath[0].length - 2],
              firstX = rawPath[0][0]

            hasError = false
            text.innerHTML = this.getNormalizedSVG(500, 500, true, onEaseError)
            hasError = (hasError || firstX > 1 || lastX < 499)

            if (hadError !== hasError) {
              this._selectionPath.style.stroke = hasError ? 'red' : '#4e7fff'
            }
          },

          handleSnap: window.PathEditor.getSnapFunction({
            x: 0,
            y: 0,
            width: 500,
            height: 500,
            containY: false,
            containX: false,
            radius: 5,
            axis: window.PathEditor.editingAxis
          })
        })
      }

    } else if (vis.editor) {
      try {

        vis.editor._anchors ??= []
        vis.editor._bezier ??= []

        vis.editor.enabled(false)

        path.style.visibility = 'hidden'

        gsap.to('.ease-instructions', {
          duration: 0.2,
          autoAlpha: 0
        })

      } catch (e) {
      }
    }
  }

  unset()
}

// when the user manually changes the custom ease text, like pasting in a chunk of SVG
function onInputCustomPath(e)
{
  let vis = e.data.vis, data, nums, ease

  if (vis && vis.custom) {
    data = vis.find('.custom_path').text()

    if (data.indexOf('<') !== -1) {
      nums = data.match(_rawPathDataExp)

      if (nums) {
        data = nums[0];
        data = window.PathEditor.getCubicSVGData(data.substr(3, data.length - 5))
      }
    }

    nums = data.match(_numbersExp)

    try {

      ease = window.CustomEase.create('custom', data, {
        height: (Math.abs(1 - nums[nums.length - 2]) < 0.01 ? -1 : 0)
      })

      vis.data('easeVisualizer').currentEase = gsap.parseEase(ease)
      createGraph(vis)

      vis.find('.ease_template').attr('d', vis.find('.graph_path_reveal').attr('d'))
      vis.editor.init()

    } catch (e) {
    }
  }
}

// elastic.out needs more room up top
function checkVertical(vis)
{
  // const basic_ease_type_select = vis.find('.basic_ease_type_select').val()
  const main_ease_class_select = vis.find('.main_ease_class_select').val()
  const target_select = vis.find('.target_select').val()
  const tall = (target_select === 'graph' && (
      main_ease_class_select === 'CustomEase' || (
        main_ease_class_select === 'elastic' ||
        main_ease_class_select === 'back' || (
          main_ease_class_select === 'rough' &&
          vis.find('.rough_ease_class_select').val() === 'elastic' &&
          vis.find('.rough_ease_type_select').val() === 'out'
        )
      ))
  )

  if (tall) {
    gsap.to(vis, { duration: 0.4, paddingTop: 220, ease: 'power2.inOut' })
    gsap.to(vis.find('.ease_menu'), { duration: 0.4, top: 220, ease: 'power2.inOut' })
    gsap.to(vis.find('#graph_path').find('rect'), { duration: 0.5, attr: { y: -200 }, ease: 'power2.inOut' })
  } else { // we decided not to animate BACK after going tall because it's annoying
    //  gsap.to(vis, { duration: 0.4,  paddingTop: 70, ease: 'power2.inOut' })
    //  gsap.to(vis.find('.ease_menu'), { duration: 0.4, top: 70, ease: 'power2.inOut' })
  }
}

function showDot()
{
  gsap.set('.ease-visualizer .dot', { visibility: 'visible' })
}
function hideDot()
{
  gsap.set('.ease-visualizer .dot', { visibility: 'hidden' })
}

function refreshTween(vis)
{
  showDot()

  const previousEaseName = vis.data('easeVisualizer').currentEaseName
  const type = vis.find('.basic_ease_type_select').val()

  let d = parseFloat(vis.find('.duration').siblings('.display').text())
  if (isNaN(d) || d === 0) d = 2.5

  vis.find('.duration').siblings('.display').text(d)

  let c = vis.find('.main_ease_class_select').val(),
    t = vis.find('.target_select').val(),
    ease

  switch (c) {
    case 'none':
      ease = 'none'

      showOnly(vis.find('.linear_ease'), vis.find('.main_ease_type'))
      // gsap.set('.custom_ease', { display: 'none' })
      break
    case 'rough':
      hideDot()

      let strength = parseFloat(vis.find('.rough_strength').siblings('.display').text())

      if (isNaN(strength) || strength === 0) strength = 1
      vis.find('.rough_strength').siblings('.display').text(strength)

      let points = parseFloat(vis.find('.rough_points').siblings('.display').text())

      if (isNaN(points) || points === 0) points = 20
      if (points > 500) points = 500

      vis.find('.rough_points').siblings('.display').text(points)

      const rc = vis.find('.rough_ease_class_select').val()
      const template = rc + '.' + vis.find('.rough_ease_type_select').val()

      ease = 'rough({ strength: ' + strength + ', points: ' + points + ', template: ' + template + ', taper: ' + vis.find('.rough_taper_select').val().replace(/"/g, '') + ', randomize: ' + vis.find('.rough_randomize_checkbox').prop('checked') + ', clamp: ' + vis.find('.rough_clamp_checkbox').prop('checked') + ' })'

      break
    case 'slow':
      hideDot()

      let ratio = parseFloat(vis.find('.slowmo_ratio').siblings('.display').text())

      if (isNaN(ratio) || ratio < 0) ratio = 0.7
      vis.find('.slowmo_ratio').siblings('.display').text(ratio)

      let power = parseFloat(vis.find('.slowmo_power').siblings('.display').text())

      if (isNaN(power) || power < 0) power = 0.7
      vis.find('.slowmo_power').siblings('.display').text(power)

      let yoyo = vis.find('.slowmo_yoyo_checkbox').prop('checked')

      ease = 'slow(' + ratio + ', ' + power + ', ' + yoyo + ')'
      break
    case 'steps':
      hideDot()

      let steps = parseInt(vis.find('.stepped_steps').siblings('.display').text(), 10)

      if (isNaN(steps) || steps === 0) steps = 12
      if (steps > 100) steps = 100

      vis.find('.stepped_steps').siblings('.display').text(steps)

      ease = 'steps(' + steps + ')'
      break
    case 'elastic':
      const amplitude = parseFloat(vis.find('.elastic_amplitude').siblings('.display').text()) || 1,
        period = parseFloat(vis.find('.elastic_period').siblings('.display').text())

      vis.find('.elastic_amplitude').siblings('.display').text(amplitude)
      vis.find('.elastic_period').siblings('.display').text(period)

      ease = 'elastic.' + type + '(' + amplitude + ', '  + period + ')'
      break
    case 'back':
      const amount = parseFloat(vis.find('.back_amount').siblings('.display').text()) || 1

      vis.find('.back_amount').siblings('.display').text(amount)
      ease = 'back.' + type + '(' + amount + ')'
      break
    case 'CustomEase':
      try {
        ease = CustomEase.create('custom', vis.find('.custom_path').text(), { height: 1 })
      } catch (e) {
      }
      break

    default:
      ease = c + '.' + type
  }

  const data = vis.data('easeVisualizer')

  data.currentVis = t
  data.currentDuration = d
  data.currentEaseName = c
  data.currentEaseType = type

  // for copy button
  data.currentEaseString = '"' + ease + '"'

  // need to parse ease because rough can include random points
  data.currentEase = gsap.parseEase(ease)

  if (!(c === 'CustomEase' && previousEaseName !== 'CustomEase') && isLoaded) {
    createGraph(vis)
  }
}

function onClickRun(e, vis)
{
  vis ||= e.data.vis

  // if in custom editing mode, create the ease now
  if (vis && vis.custom) {
    refreshTween(vis)
    run(e, vis)
  }
  if (timeline) {
    timeline.restart()
  }
}

function run(e, vis)
{
  if (typeof vis === 'undefined') {
    vis = e.data.vis
    // rebuild each run
    refreshTween(vis)
  }

  const data = vis.data('easeVisualizer')
  const graphTL = data.graphTL
  const clockTL = data.clockTL
  const boxTL = data.boxTL

  if (graphTL) graphTL.progress(0).kill()
  if (clockTL) clockTL.progress(0).kill()
  if (boxTL) boxTL.progress(0).kill()

  switch (data.currentVis) {
    case 'graph':
      runGraphVis(vis)
      break
    case 'clock':
      runClockVis(vis)
      break
    case 'box':
      runBoxVis(vis)
      break
  }
}

function runGraphVis(vis)
{
  const data = vis.data('easeVisualizer')
  const d = data.currentDuration
  const ease = data.currentEase
  const offset = 0.2

  // delay slightly to give the CPU time to breathe after all the setup (avoid jank)
  const graphTL = timeline = gsap.timeline({ delay: 0.1 })

  graphTL.add('start', offset)

  const number = vis.find('.progress_number')

  graphTL.to(
    { p: 0 }, d,
    {
      ease: 'none',
      p: 1,
      onUpdate() {
        number.text(this.targets()[0].p.toFixed(2))
      }
    },
    'start'
  )

  graphTL.fromTo(vis.find('.graph_line'), 0.0001, { autoAlpha: 0 }, { autoAlpha: 1 }, 'start')

  graphTL.fromTo(vis.find('#graph_path_reveal rect'), d, { attr: { width: 0 } }, { attr: { width: 500 }, ease: 'none' }, 'start')
  graphTL.fromTo(vis.find('.graph_liney'), d, { attr: { x1: 0, x2: 0 } }, { attr: { x1: 500, x2: 500 }, ease: 'none' }, 'start')
  graphTL.fromTo(vis.find('.progress_joint'), d, { top: '100%' }, { top: '0%', ease: ease }, 'start');
  graphTL.fromTo(vis.find('.graph_linex'), d, { attr: { y1: 500, y2: 500} }, { attr: {y1: 0, y2: 0 }, ease }, 'start')

  graphTL.fromTo(vis.find('.horizontal .progress_fill'), d, { scaleX: 0, transformOrigin: 'left center' }, { ease: 'none', scaleX: 1 }, 'start')
  graphTL.fromTo(vis.find('.vertical .progress_fill'), d, { scaleY: 0, transformOrigin: 'left bottom' }, { ease: ease, scaleY: 1 }, 'start')

  graphTL.to(vis.find('.graph_line'), 0.07, { autoAlpha: 0 })

  data.graphTL = graphTL

  return graphTL
}

function runClockVis(vis)
{
  const data = vis.data('easeVisualizer')
  const d = data.currentDuration
  const ease = data.currentEase
  const offset = 0.2

  const clockTL = timeline = gsap.timeline()

  clockTL.add('start', offset)

  clockTL.fromTo(vis.find('.clock_ease'), d, { rotation: 0, transformOrigin: 'center bottom' }, { ease, rotation: 360, force3D: true }, 'start')
  clockTL.fromTo(vis.find('.clock_linear'), d, { rotation: 0, transformOrigin: 'center bottom' }, { ease: 'none', rotation: 360, force3D: true }, 'start')
  clockTL.fromTo(vis.find('.horizontal .progress_fill'), d, { scaleX: 0, transformOrigin: 'left center' }, { ease: 'none', scaleX: 1, force3D: true }, 'start')

  data.clockTL = clockTL
}

function runBoxVis(vis)
{
  const data = vis.data('easeVisualizer')
  const d = data.currentDuration
  const ease = data.currentEase
  const easeType = data.currentEaseType
  const offset = 0.2

  const boxTL = timeline = gsap.timeline()

  boxTL.add('start', offset)

  boxTL.fromTo(vis.find('.box_power0'), d, { x: "0%" }, { ease: 'power0.in', x: '400%', force3D: true }, 'start')
  boxTL.fromTo(vis.find('.box_power1'), d, { x: "0%" }, { ease: 'power1.' + easeType || 'power1.out', x: '400%', force3D: true }, 'start')
  boxTL.fromTo(vis.find('.box_power2'), d, { x: "0%" }, { ease: 'power2.' + easeType || 'power2.out', x: '400%', force3D: true }, 'start')
  boxTL.fromTo(vis.find('.box_power3'), d, { x: "0%" }, { ease: 'power3.' + easeType || 'power3.out', x: '400%', force3D: true }, 'start')
  boxTL.fromTo(vis.find('.box_power4'), d, { x: "0%" }, { ease: 'power4.' + easeType || 'power4.out', x: '400%', force3D: true }, 'start')
  boxTL.fromTo(vis.find('.box_custom'), d, { x: "0%" }, { ease, x: '400%', force3D: true }, 'start')

  boxTL.fromTo(
    vis.find('.horizontal .progress_fill'), d,
    { scaleX: 0, transformOrigin: 'left center' },
    { ease: 'none', scaleX: 1, force3D: true },
    'start'
  )

  data.boxTL = boxTL
}

function createGraph(vis)
{
  let name = vis.find('.main_ease_class_select').val(),
    data = vis.data('easeVisualizer'),
    precision = (name === 'steps' || name === 'bounce' || name === 'elastic') ? 3 : 1,
    ease = data.currentEase || 'none',
    mainEase = data.currentEaseName,
    fullEaseName = mainEase + '.' + data.currentEaseType,

    // note: we created a simplified version of elastic.out and the back eases, but only with the default configuration so if there is any customization, we should just do the auto-tracing.
    customString = ((fullEaseName !== 'elastic.out' && mainEase !== 'back') || ease === 'elastic.out(1, 0.3)' || ease === 'back.out(1.7)') ? customStrings[fullEaseName] : null,

    $customPath = vis.find('.custom_path'),
    simplified,
    path

  if (customString) {
    $customPath.text(customString)
    path = customSVG[fullEaseName]

  } else {
    path = window.CustomEase.getSVGData(ease, {
      width: 500,
      height: 500,
      precision: precision
    })

    simplified = ease.custom || ease.rawBezier
      ? path
      : window.PathEditor.simplifySVG(path, {
        tolerance: (precision === 1) ? 3 : 1,
        cornerThreshold: (mainEase === 'bounce')
          ? 130
          : (mainEase === 'steps' || mainEase === 'rough')
            ? 180
            : 0
      })

    $customPath.text(
      window.CustomEase.getSVGData(
        new CustomEase('custom', simplified, { height: 500 }),
        { width: 1, height: -1, y: 1, precision: precision }
      )
    )
  }

  if (isLoaded) {
    gsap.to('.graph_path', { duration: 0.4, morphSVG: path })
    vis.find('.graph_path_reveal').attr('d', path)
  }
}

function showOnly(target, set)
{
  gsap.set(target, { display: '' })
  gsap.set(set.not(target), {
    display: 'none'
  })
}

function copyToClipboard(text)
{
  if (window.clipboardData && window.clipboardData.setData) {
    // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible
    return clipboardData.setData('Text', text)

  } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
    const textarea = document.createElement('textarea')

    textarea.textContent = text
    textarea.style.position = 'fixed' // Prevent scrolling to bottom of page in Microsoft Edge
    document.body.appendChild(textarea)
    textarea.select()

    try {
      // Security exception may be thrown by some browsers
      return document.execCommand('copy')
    } catch (ex) {
      console.warn('Copy to clipboard failed.', ex)
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}

function onCopyClick(e)
{
  const data = e.data.vis.data('easeVisualizer')
  const vis = e.data.vis

  let text

  if (data.currentEaseName === 'CustomEase') {
    text = 'CustomEase.create("custom", "' + vis.find('.custom_path').text() + '");'
  } else {
    text = data.currentEaseString
  }

  copyInnerToClipboard(text, this)
}

function onShareClick(e)
{
  copyInnerToClipboard(shareURL + e.data.vis.find('.custom_path').text(), this)
}

function copyInnerToClipboard(text, btn)
{
  copyToClipboard(text)

  if (btn) {
    gsap.fromTo(btn, { color: 'black' }, { duration: 0.7, color: 'white' })
  }
}

$.fn.easeVisualizer = function(method) {
  if (methods[method]) {
    return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
  } else if (typeof method === 'object' || !method) {
    return methods.init.apply(this, arguments)
  } else {
    $.error('Method ' + method + ' does not exist')
  }
}

let dimmer, activeOverlay, overlayZIndex, exportedRoot, overlayOnComplete

/*
*	adds simple showBasicOverlay() and hideBasicOverlay() methods to the window. Just pass a DOM element to showBasicOverlay()
* and optionally a callback that should be called when the overlay closes, like showBasicOverlay(myElement, myFunction);
* and it'll handle animating it in/out, centering it in the window, and creating a dimmed background that senses clicks
* to close itself. It also pauses all GSAP-driven animations that were running, and then resumes them again when it closes.
*/
function showBasicOverlay(overlay, onComplete)
{
  if (!overlay) return console.log('Error: no overlay argument provided to showBasicOverlay()')

  if (activeOverlay) { // if there's already one open, immediately close it.
    gsap.set(activeOverlay, { autoAlpha: 0, display: 'none' })

    if (overlayZIndex) {
      activeOverlay.style.zIndex = overlayZIndex
    } else {
      gsap.set(activeOverlay, { clearProps: 'zIndex' })
    }
    if (exportedRoot) {
      exportedRoot.resume()
    }
  }

  activeOverlay = overlay[0] || overlay // in case it's a jQuery object
  overlayZIndex = activeOverlay.style.zIndex

  if (gsap || window.gsap) {
    exportedRoot = gsap.exportRoot().pause()
  }

  gsap.set(activeOverlay, { opacity: 0, zIndex: 5000, xPercent: -50, yPercent: -50, x: 0, display: 'block' })
  gsap.to(dimmer, { duration: 0.25, autoAlpha: 0.6, ease: 'none' })
  gsap.to(activeOverlay, { duration: 0.25, autoAlpha: 1, force3D: true })

  overlayOnComplete = onComplete

  return false
}

function hideBasicOverlay()
{
  if (activeOverlay) {
    gsap.to(dimmer, { duration: 0.2, autoAlpha: 0, ease: 'none', onComplete: overlayOnComplete })

    gsap.set(activeOverlay, {
      display: 'none',
      autoAlpha: 0,
      onComplete() {
        if (overlayZIndex) {
          activeOverlay.style.zIndex = overlayZIndex
        } else {
          gsap.set(activeOverlay, { clearProps: 'zIndex' })
        }

        activeOverlay = null

        if (exportedRoot) {
          exportedRoot.resume()
        }
      }
    })
  }
}

window.showBasicOverlay = showBasicOverlay
window.hideBasicOverlay = hideBasicOverlay

function preventRedirect()
{
  let handler

  window.addEventListener('beforeunload', handler = e => {
      e.preventDefault()
      e.returnValue = ''

      return ''
    }
  )

  return () => {
    window.removeEventListener('beforeunload', handler)
  }
}

$(document).ready(function() {
  // noinspection JSCheckFunctionSignatures
  gsap.config({ trialWarn: false })

  dimmer = document.getElementById('overlay-dimmer')

  if (!dimmer) {
    dimmer = document.createElement('div')

    dimmer.setAttribute('id', 'overlay-dimmer')
    dimmer.style.cssText = 'width: 100%; height: 100%; background-color: black; opacity: 0.5; position: fixed; top: 0; left: 0; z-index: 3000; cursor: pointer; visibility: hidden;'
    gsap.set(dimmer, { force3D: true })

    ;(document.body || document.documentElement)
      .appendChild(dimmer)
  }

  dimmer.onclick = hideBasicOverlay

  $('.ease-visualizer').each(function() {
    const $self = $(this)

    $self
      .css({
        padding: '70px 20px 20px',
        borderRadius: '10px',
        backgroundColor: '#222',
        color: '#999'
      })
      .easeVisualizer({
        startEase: $self.data('ease') || 'power2.out',
        lightTheme: $self.data('light')
      })
  })
})
