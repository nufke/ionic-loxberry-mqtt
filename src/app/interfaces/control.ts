export interface Control {
  id: string,
  name: string,
  icon: {
    name: string,
    href?: string,
    color?: string
  }
  type: string,
  room: string,
  category: string,
  is_favorite?: Boolean,
  is_visible?: Boolean,
  is_protected?: Boolean,
  is_movable?: Boolean,
  priority?: number,
  state: {
    value: string | Number,
    format?: string,
    color?: string,
    message?: string // TODO move outside interface
  }
}
  