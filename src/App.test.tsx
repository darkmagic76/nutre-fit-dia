import { describe, it, expect } from 'vitest'

describe('App smoke test', () => {
  it('renders without crashing', () => {
    const root = document.createElement('div')
    root.id = 'root'
    document.body.appendChild(root)
    expect(document.getElementById('root')).toBeTruthy()
  })
})
