const APromise = require('./a-promise')
const log = require('./logger')

// 結論として実行したいこと
// const side = 10
// const squareArea = side * side
// console.log(squareArea)

// APromiseで上の処理を行うとすると
// 一辺がsideの四角形の面積を求めるpromiseを作成する
const squareAreaAbstraction = (side) => {
  const result = APromise.createPromise()
  APromise.fulfil(result, side * side)
  return result
}
// 与えられた引数を標準出力するpromiseを作成する
const printAbstraction = (squareArea) => {
  const result = APromise.createPromise()
  APromise.fulfil(result, log(squareArea))
  return result
}

// 一番元のpromiseを作成する
const sidePromise = APromise.createPromise()
// dependenciesに追加する
const squareAreaPromise = APromise.depend(sidePromise, squareAreaAbstraction)
const printPromise = APromise.depend(squareAreaPromise, printAbstraction)

// 実際にsidePromiseをfulfilし、処理を開始する
APromise.fulfil(sidePromise, 10)

log(printPromise)
