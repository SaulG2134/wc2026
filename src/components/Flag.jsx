import { F } from '../constants.js'

export default function Flag({ url, name, size = 22 }) {
  if (url && url.startsWith('http')) {
    return (
      <img
        src={url}
        alt={name || ''}
        style={{
          width: size * 1.45,
          height: size,
          objectFit: 'cover',
          borderRadius: 2,
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
        }}
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
    )
  }
  return <span style={{ fontSize: size, lineHeight: 1, flexShrink: 0 }}>{F[name] || '🏳️'}</span>
}
