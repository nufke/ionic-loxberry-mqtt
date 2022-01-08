export interface Control {
  topic: string,
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
  order?: number,
  state: {
    value: string,
    format?: string,
    color?: string,
    states?: string[],
    _message?: string, // INTERNAL USE ONLY, NOT PART OF API
    _toggle?: Boolean // INTERNAL USE ONLY, NOT PART OF API
  }
}

export interface Category {
  topic: string,
  name: string,
  icon: {
    name: string,
    href?: string,
    color?: string
  }
  image: string,
  is_visible?: Boolean,
  is_protected?: Boolean,
  order?: number
}

export interface Room {
  topic: string,
  name: string,
  icon: {
    name: string,
    href?: string,
    color?: string
  }
  image: string,
  is_visible?: Boolean,
  is_protected?: Boolean,
  order?: number
}
