import { TextSelection } from 'prosemirror-state'
import { minMax } from '../../utils/minMax'
import type { Command, Commands, Range } from '../../types'

declare module '@hetero/editor' {
  interface Commands {
    setTextSelection: Command<{
      position: number | Range
    }>
  }
}

export const setTextSelection: Commands['setTextSelection'] =
  ({ position }) =>
  ({ tr, dispatch }) => {
    if (dispatch) {
      const { doc } = tr
      const { from, to } =
        typeof position === 'number'
          ? { from: position, to: position }
          : position
      const minPos = TextSelection.atStart(doc).from
      const maxPos = TextSelection.atEnd(doc).to
      const resolvedFrom = minMax(from, minPos, maxPos)
      const resolvedEnd = minMax(to, minPos, maxPos)
      const selection = TextSelection.create(doc, resolvedFrom, resolvedEnd)

      tr.setSelection(selection)
    }

    return true
  }
