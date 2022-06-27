import type {
  Mark as ProseMirrorMark,
  Node as ProseMirrorNode,
  SchemaSpec,
} from 'prosemirror-model'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import type { EditorCore } from './core'

export type MaybeReturnType<T> = T extends (...args: any) => any
  ? ReturnType<T>
  : T

export type AddNodesSchema<NodeNames extends string> = Partial<SchemaSpec<NodeNames, any>>
export type AddMarksSchema<MarkNames extends string> = Partial<SchemaSpec<any, MarkNames>>

type _inferCommandsArgsForExec<K extends keyof Commands> = {
  [N in K]: Commands[N] extends Command<infer A> ? (args: A) => boolean : never
}
export type PrimitiveCommandsMap = _inferCommandsArgsForExec<keyof Commands>
type _inferCommandsArgsForChain<K extends keyof Commands> = {
  [N in K]: Commands[N] extends Command<infer A> ? (args: A) => RunCommandsChain : never
}
export type RunCommandsChain = _inferCommandsArgsForChain<keyof Commands> & {
  run: () => boolean
}

export type Command<T = {}> = (args: T) => CommandPrimitive
export type CommandPrimitive = (props: CommandProps) => boolean
export interface CommandProps {
  core: EditorCore
  tr: Transaction
  state: EditorState
  view: EditorView
  commands: PrimitiveCommandsMap
  dispatch?: (tr: Transaction) => void
}
export interface ExtensionAttribute {
  extName: string
  name: string
  attr: Attribute
}
export interface Attribute {
  default: any
  rendered?: boolean
  renderHTML?: ((attributes: Record<string, any>) => Record<string, any> | null) | null
  parseHTML?: ((element: HTMLElement) => any | null) | null
  keepOnSplit: boolean
  isRequired?: boolean
}

export interface Range {
  from: number
  to: number
}
export interface NodeRange {
  node: ProseMirrorNode
  from: number
  to: number
}
export interface MarkRange {
  mark: ProseMirrorMark
  from: number
  to: number
}
