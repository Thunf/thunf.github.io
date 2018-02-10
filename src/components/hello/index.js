const components = {
  empty: () => import(/* webpackChunkName: "empty" */'./empty'),
  demo: () => import(/* webpackChunkName: "demo" */'./demo'),
  demx: () => import(/* webpackChunkName: "demx" */'./demx')
}

export default (keys = Object.keys(components)) => {
  return Object.assign({}, ...keys.map((key) => {
    return {[key]: components[key]}
  }).filter(v => v))
}
