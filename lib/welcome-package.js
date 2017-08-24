/** @babel */

import {CompositeDisposable} from 'soldat'
import ReporterProxy from './reporter-proxy'

let WelcomeView, GuideView, ConsentView

const WELCOME_URI = 'soldat://welcome/welcome'
const GUIDE_URI = 'soldat://welcome/guide'
const CONSENT_URI = 'soldat://welcome/consent'

export default class WelcomePackage {
  constructor () {
    this.reporterProxy = new ReporterProxy()
  }

  async activate () {
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(soldat.workspace.addOpener((filePath) => {
      if (filePath === WELCOME_URI) {
        return this.createWelcomeView({uri: WELCOME_URI})
      }
    }))

    this.subscriptions.add(soldat.workspace.addOpener((filePath) => {
      if (filePath === GUIDE_URI) {
        return this.createGuideView({uri: GUIDE_URI})
      }
    }))

    this.subscriptions.add(soldat.workspace.addOpener((filePath) => {
      if (filePath === CONSENT_URI) {
        return this.createConsentView({uri: CONSENT_URI})
      }
    }))

    this.subscriptions.add(
      soldat.commands.add('soldat-workspace', 'welcome:show', () => this.show())
    )

    if (soldat.config.get('core.telemetryConsent') === 'undecided') {
      await soldat.workspace.open(CONSENT_URI)
    }

    if (soldat.config.get('welcome.showOnStartup')) {
      await this.show()
      this.reporterProxy.sendEvent('show-on-initial-load')
    }
  }

  show () {
    return Promise.all([
      soldat.workspace.open(WELCOME_URI, {split: 'left'}),
      soldat.workspace.open(GUIDE_URI, {split: 'right'})
    ])
  }

  consumeReporter (reporter) {
    return this.reporterProxy.setReporter(reporter)
  }

  deactivate () {
    this.subscriptions.dispose()
  }

  createWelcomeView (state) {
    if (WelcomeView == null) WelcomeView = require('./welcome-view')
    return new WelcomeView({reporterProxy: this.reporterProxy, ...state})
  }

  createGuideView (state) {
    if (GuideView == null) GuideView = require('./guide-view')
    return new GuideView({reporterProxy: this.reporterProxy, ...state})
  }

  createConsentView (state) {
    if (ConsentView == null) ConsentView = require('./consent-view')
    return new ConsentView({reporterProxy: this.reporterProxy, ...state})
  }
}
