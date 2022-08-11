import { EditorState } from 'prosemirror-state'
import { Node, Schema } from 'prosemirror-model'
import { EditorView } from 'prosemirror-view'
import type {
  EditorStateConfig,
  Plugin as ProseMirrorPlugin,
  Transaction,
} from 'prosemirror-state'
import { keymap } from 'prosemirror-keymap'
import { TypeEvent } from '@hetero/shared'
import { getLogger } from '../utils/logger'
import { ExtensionType } from '../extensions/editorExtension'
import type { EditorLogger } from '../utils/logger'
import type { IEditorExtension } from '../extensions'
import type { IEditorMark } from '../extensions/editorExtension'
import { createBuiltinFuncExts } from '../extensions/funcs/builtinFuncExts'
import { mergeSchemaSpecs } from './schema'
import { inputRules, pasteRules } from './rule'
import { CommandManager } from './commandManager'
import { HelpersManager } from './helpers/helpersManager'
import { ActiveManager } from './activeManager'
import { getAllBuiltinPlugins } from './plugins'
import type { PatternRule } from './rule'

export interface EditorOptions {
  container: string | HTMLElement // editor mount point
  isReadOnly: boolean // editor mode
  doc?: any // given document data to initialize editor
  autofocus?: boolean
}
export interface EditorCoreEvent {
  'rendered': { timeCost: number }
  'dispatchedTransaction': null
  'activateInputFastPath': { left: number; top: number }
  'deactivateInputFastPath': { isContentChanged: boolean }
}

export class EditorCore extends TypeEvent<EditorCoreEvent> {
  options: EditorOptions
  extensions: IEditorExtension[]
  schema: Schema
  view: EditorView
  logger: EditorLogger
  cmdManager: CommandManager
  helpers: HelpersManager
  activeManager: ActiveManager

  constructor(options: EditorOptions, coreConfig: {
    extensions: (core: EditorCore) => IEditorExtension[]
  }) {
    super()
    const { extensions } = coreConfig
    this.options = options
    this.extensions = [
      ...createBuiltinFuncExts(this),
      ...extensions(this),
    ]

    // Initialize schema and commands set needs extensions to be ready
    this.schema = this.initSchema()
    this.cmdManager = new CommandManager(this)
    this.helpers = new HelpersManager(this)
    this.activeManager = new ActiveManager(this)
    this.logger = getLogger('HeteroEditor core')
    this.view = this.initEditorView()
  }

  private dispatchTransaction = (tr: Transaction) => {
    try {
      const { view } = this
      // Todo: Traverse all extensions to execute their beforeTransaction hooks
      const newState = view.state.apply(tr)
      // Todo: Traverse all extensions to execute their afterTransaction hooks
      view.updateState(newState)
      this.emit('dispatchedTransaction')
    }
    catch (err) {
      this.logger.error(err)
    }
  }

  private resolveAllPlugins = () => {
    // Resolve editor extensions' specs
    const allInputRules = this.extensions.reduce((prev, curr) => [...prev, ...(curr.inputRules?.() ?? [])], [] as PatternRule[])
    const allPasteRules = this.extensions.reduce((prev, curr) => [...prev, ...(curr.pasteRules?.() ?? [])], [] as PatternRule[])
    const allKeymapPlugins = this.extensions.reduce((prev, curr) => {
      const bindings = Object.fromEntries(
        Object
          .entries(curr.keymaps?.() || {})
          .map(([shortcut, method]) => {
            return [shortcut, () => method({ core: this })]
          }),
      )

      const keyMapPlugin = keymap(bindings)
      return [
        ...prev,
        keyMapPlugin,
      ]
    }, [] as ProseMirrorPlugin[])
    const proseMirrorPluginsByExtensions = this.extensions.reduce(
      (prev, curr) => [...prev, ...(curr.getProseMirrorPlugin?.() ?? [])],
      [] as ProseMirrorPlugin[],
    )

    return [
      ...getAllBuiltinPlugins(this),
      ...inputRules({ core: this, rules: allInputRules }),
      ...pasteRules({ core: this, rules: allPasteRules }),
      ...allKeymapPlugins,
      ...proseMirrorPluginsByExtensions,
    ]
  }

  private initEditorView = () => {
    const { schema, dispatchTransaction } = this
    const { isReadOnly, doc, container } = this.options

    let editorMountContainer: HTMLElement
    if (typeof container === 'string') {
      const queryBySelector = document.querySelector<HTMLElement>(container)
      if (queryBySelector) { editorMountContainer = queryBySelector }
      else {
        const errMsg = 'editor initialize failed: container not found'
        this.logger.error(errMsg)
        throw new Error(errMsg)
      }
    }
    else {
      editorMountContainer = container
    }

    const editorStateConfig: EditorStateConfig = {
      schema,
      plugins: this.resolveAllPlugins(),
    }
    if (isReadOnly) {
      // readonly mode must be given document data
      if (doc) {
        editorStateConfig.doc = Node.fromJSON(schema, doc)
      }
      else {
        const errMsg = 'editor initialize failed: readonly mode but no doc data'
        this.logger.error(errMsg)
        throw new Error(errMsg)
      }
    }

    const initState = EditorState.create(editorStateConfig)
    const view = new EditorView(editorMountContainer, {
      state: initState,
      dispatchTransaction,
    })
    return view
  }

  private initSchema = () => {
    const allSchemaSpecs = this.extensions.map(ext => ext.schemaSpec?.() ?? {})
    return new Schema(mergeSchemaSpecs(allSchemaSpecs))
  }

  public getMarkExtensions = (): IEditorMark[] => {
    return this.extensions.filter(ext => ext.type === ExtensionType.mark)
  }

  public getSplittedableMarks = (): IEditorMark[] => {
    return this.getMarkExtensions().filter((markExt) => {
      return markExt.keepOnSplit
    })
  }

  public get isDestroyed() {
    return this.view?.isDestroyed
  }

  public get commands() {
    return this.cmdManager.getSingleCommands()
  }
}