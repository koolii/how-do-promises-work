const log = require('./logger')

const state = {
  PENDING: 'pending',
  FULFIL: 'fulfil',
  REJECT: 'reject',
}

let id = 0

class APromise {
  static createPromise() {
    id += 1
    return {
      // 見やすいようにIDを付与させる
      id,
      // promiseは最初は値を持たない
      value: null,
      // 初期値はpending
      state: state.PENDING,
      // 依存関係も最初はない
      dependencies: [],
    }
  }

  // Promiseの従属性の付与を行う
  // Promiseが'pending'状態にある間、本当に必要なのは
  // Promiseの従属性を追跡することだけと考える
  // expression引数にはpromiseを返す関数を渡す
  static depend(promise, expression) {
    // 式を計算できるようになった時に
    // その値を含むpromiseを返す必要がある
    const result = APromise.createPromise()

    // まだ式を実行できない場合は、将来の値のために従属性リストに追加しておく
    if (promise.state === state.PENDING) {
      promise.dependencies.push((value) => {
        // 式の最終的な値に関心を持つため
        // この値をこのpromiseのresult promiseに入れる
        APromise.depend(expression(value), (newValue) => {
          // dependはpromiseを一つ必要とするので、
          // 空のpromiseを返す
          APromise.fulfil(result, newValue)

          return APromise.createPromise()
        })
      })
    } else {
      // 式が実行可能な場合、ただ実行して、挿入すべき値が用意できる
      APromise.depend(expression(promise.value), (newValue) => {
        APromise.fulfil(result, newValue)

        // dependはpromiseを一つ必要とするので、
        // 空のpromiseを返す
        return APromise.createPromise()
      })
    }

    return result
  }

  // fulfilはpromiseのstateをFULFILに更新する
  // dependenciesを実行し、連結したpromiseを生成する
  static fulfil(promise, value) {
    if (promise.state !== state.PENDING) {
      throw new Error('Trying to fulfil an already fulfilled promise!')
    }

    promise.state = state.FULFIL
    promise.value = value

    // ある従属関係がこのpromiseと他の従属関係を追加している可能性があるので
    // 従属関係リストを一旦クリーンコピーすることで
    // イテレーションが影響を受けないようにする
    const { dependencies } = promise
    promise.dependencies = []

    log(dependencies)

    dependencies.forEach((expression) => {
      expression(value)
    })
  }
}

module.exports = APromise
