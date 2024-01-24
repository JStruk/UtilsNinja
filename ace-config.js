import ace from 'ace-builds'

import modeJsonUrl from 'ace-builds/src-noconflict/mode-json?url'
import themeChromeUrl from 'ace-builds/src-noconflict/theme-chrome?url'
import workerBaseUrl from 'ace-builds/src-noconflict/worker-base?url'
import workerJsonUrl from 'ace-builds/src-noconflict/worker-json?url'
import snippetsJsonUrl from 'ace-builds/src-noconflict/snippets/json?url'
import 'ace-builds/src-noconflict/ext-language_tools'

ace.config.setModuleUrl('ace/mode/json', modeJsonUrl)

ace.config.setModuleUrl('ace/theme/chrome', themeChromeUrl)

ace.config.setModuleUrl('ace/mode/base', workerBaseUrl)

ace.config.setModuleUrl('ace/mode/json_worker', workerJsonUrl)

ace.config.setModuleUrl('ace/snippets/json', snippetsJsonUrl)

ace.require('ace/ext/language_tools')