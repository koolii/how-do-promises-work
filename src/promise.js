const state = {
  PENDING: 'pending',
  FULFIL: 'fulfil',
  REJECT: 'reject',
}

class APromise {
  static createPromise() {
    return {
      // promiseは最初は値を持たない
      value: null,
      // 初期値はpending
      state: 'pending',
      // 依存関係も最初はない
      dependencies: [],
    }
  }

  // Promiseの従属性の付与を行う
  // Promiseが'pending'状態にある間、本当に必要なのは
  // Promiseの従属性を追跡することだけと考える
  static depend(promise, expression) {
    const result = APromise.createPromise()

    if (promise.state === state.PENDING) {
      promise.dependencies.push((value) => {
        APromise.depend(expression(value), (newValue) => {
          APromise.fulfil(result, newValue)

          return APromise.createPromise()
        })
      })
    } else {
      APromise.depend(expression(promise.value), (newValue) => {
        APromise.fulfil(result, newValue)
        return APromise.createPromise()
      })
    }

    return result
  }

  static fulfil(promise, value) {
    if (promise.state !== state.PENDING) {
      throw new Error('Trying to fulfil an already fulfilled promise!')
    }

    promise.state = state.FULFIL
    promise.value = value

    const { dependencies } = promise
    promise.dependencies = []

    dependencies.forEach((expression) => {
      expression(value)
    })
  }
}

module.exports = APromise
