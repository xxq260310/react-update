import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-addons-test-utils'
import update from '../src'

describe('update', () => {

  class Test extends Component {
    constructor() {
      super()
      this.update = update.bind(this)
      this.state = {
        x: {
          y: 0
        },
        list: [0]
      }
    }
    componentWillMount() {
      this.props.update && this.props.update(this)
    }
    render() {
      return null
    }
  }

  function render(update) {
    return TestUtils.renderIntoDocument(<Test update={update} />)
  }

  it('should split works', () => {
    const { state } = render(instance => {
      instance.update('set', 'x.y', 1)
      instance.update('set', 'list[0]', 1)
    })
    expect(state.x.y).toBe(1)
    expect(state.list[0]).toBe(1)
  })

  it('should set works', () => {
    const { state } = render(instance => {
      instance.update('set', 'a', 1)
      instance.update('set', ['x', 'y'], 1)
    })
    expect(state.a).toBe(1)
    expect(state.x.y).toBe(1)
  })

  it('should push works', () => {
    const { state } = render(instance => {
      instance.update('push', 'list', 1)
    })
    expect(state.list[1]).toBe(1)
  })

  it('should splice works', () => {
    const { state } = render(instance => {
      instance.update('splice', 'list', 0)
    })
    expect(state.list.length).toBe(0)
  })

  it('should multiple props works', () => {
    const { state } = render(instance => {
      instance.update(['set', ['x', 'y'], 1], ['push', 'list', 1])
    })
    expect(state.x.y).toBe(1)
    expect(state.list[1]).toBe(1)
  })


  it('should multiple calls saved', () => {
    const { state } = render(instance => {
      instance.update('set', ['x', 'y'], 1)
      instance.update('set', ['x', 'z'], 1)
      instance.update('push', 'list', 1)
      instance.update('push', 'list', 1)
    })
    expect(state.x.y).toBe(1)
    expect(state.x.z).toBe(1)
    expect(state.list[1]).toBe(1)
    expect(state.list[2]).toBe(1)
  })

  it('should return works', () => {
    render(instance => {
      const x = instance.update('set', ['x', 'y'], 1)
      expect(x.y).toBe(1)
    })
  })

  it('should return works which multiple orders passed', () => {
    render(instance => {
      const result = instance.update(['set', ['x', 'y'], 1], ['push', 'list', 1])
      expect(result.x.y).toBe(1)
      expect(result.list[1]).toBe(1)
    })
  })

  it('should return works which multiple orders passed on single prop', () => {
    render(instance => {
      const x = instance.update(['set', ['x', 'y'], 1], ['set', ['x', 'z'], 1])
      expect(x.y).toBe(1)
      expect(x.z).toBe(1)
    })
  })

  it('should return saved which multiple calls on single single prop', () => {
    render(instance => {

      instance.update('set', ['x', 'y'], 1)
      const x = instance.update('set', ['x', 'z'], 1)
      expect(x.y).toBe(1)
      expect(x.z).toBe(1)

      instance.update('push', 'list', 1)
      const list = instance.update('push', 'list', 1)
      expect(list[1]).toBe(1)
      expect(list[2]).toBe(1)
    })
  })

  it('should set multiple as object works', () => {
    render(instance => {
      const result = instance.update('set', {
        'x.y': 1,
        'x.z': 1,
        list: 1
      })
      expect(result.x.y).toBe(1)
      expect(result.x.z).toBe(1)
      expect(result.list).toBe(1)
    })
  })

  it('should update.get works', () => {
    let parent
    class Child extends Component {
      constructor() {
        super()
        parent = update.get('parent')
      }
      render() {
        return null
      }
    }
    class Parent extends Component {
      constructor() {
        super()
        this.update = update.bind(this, 'parent')
      }
      render() {
        return <Child />
      }
    }
    const instance = TestUtils.renderIntoDocument(<Parent />)
    expect(parent).toEqual(instance)
  })

  it('should shouldComponentUpdate works', () => {
    const childRender = jest.fn()
    class Child extends Component {
      constructor() {
        super()
      }
      render() {
        childRender()
        return null
      }
    }
    class Parent extends Component {
      constructor() {
        super()
        this.update = update.bind(this)
        this.state = {
          x: 0,
          a: {b: 1}
        }
      }
      render() {
        return <Child fn={() => 1} a={this.state.a} />
      }
    }
    const instance = TestUtils.renderIntoDocument(<Parent />)
    instance.update('set', 'x', 1)
    expect(childRender.mock.calls.length).toBe(1)
  })
})